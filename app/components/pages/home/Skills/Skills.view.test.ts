import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import { buildSkillGroups } from "~/assets/api/mock/build";
import { staticSources } from "~/assets/api/mock/sources.static";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import { SKILL_TILE_META } from "~/components/ui/UiSkillTile/skillTile";
import type { SkillGroupView } from "~/assets/api/types/catalog";
import { SKILL_GROUP_IDS } from "~/assets/api/types/resume";
import Skills from "./Skills.vue";
import { buildSkillPanels } from "./skillPanels";
import { skillTileId } from "./skillIds";
import { skillWaveOrder, skillWaveSwapTime } from "./skillWave";
import { SKILL_SWAP_PERIOD } from "./useSkillSwap";
import { buildToolkit, TOOLKIT_STATIC_COUNT, TOOLKIT_TYPED_COUNT } from "./toolkit";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface SkillsCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
  tall?: boolean;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: SkillsCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: SkillsCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const customTransitions = [
  ".home-skills-night",
  ".home-skills-day",
  ".home-skills-accent",
  ".home-skills-band",
  ".home-skills-type",
  ".home-skills-cursor",
];

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
}

function transitioning(element: Element, property: string, pseudo: string | null = null) {
  return document.getAnimations().some((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === property &&
      effect?.target === element &&
      effect.pseudoElement === pseudo
    );
  });
}

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

const groupsOf: Record<Locale, SkillGroupView[]> = {
  en: buildSkillGroups(staticSources("en"), "en"),
  ru: buildSkillGroups(staticSources("ru"), "ru"),
};

const { panels: skillPanels, steps: skillWaveSteps } = buildSkillPanels(groupsOf.en);

const additionalOf = (groups: SkillGroupView[]) =>
  groups.find((group) => group.id === "additional")!.skills;

const toolkit = buildToolkit(additionalOf(groupsOf.en));

const descriptionTerms: Record<string, string> = {
  vue: "Vue.js",
  nest: "NestJS",
  tauri: "Tauri",
  rust: "Rust",
};

function description(message: string) {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => descriptionTerms[key]!);
}

const TYPE_CHAR_MS = 85;
const HOLD_MS = 1400;
const ERASE_CHAR_MS = 45;
const PAUSE_MS = 300;

const typingSlots = toolkit.typed.reduce<{ typed: number; erased: number; end: number }[]>(
  (slots, item) => {
    const start = slots.at(-1)?.end ?? 0;
    const typed = start + item.text.length * TYPE_CHAR_MS;
    const erased = typed + HOLD_MS + item.text.length * ERASE_CHAR_MS;
    return [...slots, { typed, erased, end: erased + PAUSE_MS }];
  },
  [],
);

const typingCycle = typingSlots.at(-1)!.end;

const heldAt = (index: number) => typingSlots[index]!.typed + HOLD_MS / 2;

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-skills-night, .home-skills-day").length;
}

async function prefetchThemeLayers(screen: { container: HTMLElement }) {
  useThemeLayersPrefetch().prefetch();
  await expect.poll(() => layerCount(screen)).toBe(2);
  screen.container.getBoundingClientRect();
}

async function renderCase(
  item: Pick<SkillsCase, "width" | "height" | "locale" | "tall">,
  data?: SkillGroupView[],
  offset = 0,
) {
  await page.viewport(item.width, item.tall ? 1800 : item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const groups = data ?? groupsOf[locale];
  const screen = await render(
    () =>
      h(
        "div",
        {
          class: "bg-base-100 font-body text-base-content",
          style: offset ? { marginTop: `${offset}px` } : undefined,
        },
        h(Skills, { groups }),
      ),
    { global: { plugins: [createApp(locale)] } },
  );
  await expect.poll(() => layerCount(screen)).toBe(1);
  if (item.tall) screen.container.querySelector<HTMLElement>(".home-skills")!.style.minHeight = "0";
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderCase>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function box(screen: Screen, selector: string, element?: Element) {
  const slide = pick(screen, ".home-skills").getBoundingClientRect();
  const rect = (element ?? pick(screen, selector)).getBoundingClientRect();
  return {
    left: rect.left - slide.left,
    top: rect.top - slide.top,
    right: slide.right - rect.right,
    bottom: slide.bottom - rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

const tiles = skillPanels.flatMap((panel) => panel.tiles);

const panelSizes = skillPanels.map((panel) => panel.tiles.length);

function swapTime(tile: (typeof tiles)[number], index = 0) {
  return skillWaveSwapTime(tile.phase, skillWaveSteps, SKILL_SWAP_PERIOD, index);
}

function walk() {
  const offsets = panelSizes.map((_, index) =>
    panelSizes.slice(0, index).reduce((sum, size) => sum + size, 0),
  );
  return skillWaveOrder(panelSizes).map(({ panel, tile }) => offsets[panel]! + tile);
}

function tileLabels(screen: Screen) {
  return pickAll(screen, ".skill-tile").map(
    (tile) =>
      tile.querySelector(".skill-tile-layer:not([aria-hidden]) .skill-tile-label")?.textContent,
  );
}

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
  await nextTick();
}

async function waitFrames(check: () => boolean, timeout = 5000) {
  const start = performance.now();
  while (!check() && performance.now() - start < timeout) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return check();
}

async function waitSwapTimers(before: number) {
  expect(await waitFrames(() => vi.getTimerCount() - before >= tiles.length)).toBe(true);
}

async function waitDecorReady(screen: Screen) {
  await expect
    .poll(() => pick(screen, ".home-skills-typing").classList.contains("decor-paused"), {
      timeout: 5000,
    })
    .toBe(false);
}

function typedItems(screen: Screen) {
  return pickAll<HTMLElement>(screen, ".home-skills-type");
}

function typeWindow(screen: Screen) {
  return pick<HTMLElement>(screen, ".home-skills-type-window");
}

function charWidth(screen: Screen) {
  const max = Number(
    getComputedStyle(typeWindow(screen)).getPropertyValue("--home-skills-type-max"),
  );
  return typeWindow(screen).offsetWidth / max;
}

function textRect(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}

function visibleChars(screen: Screen) {
  const view = typeWindow(screen).getBoundingClientRect();
  const ch = charWidth(screen);
  return typedItems(screen).map((item) => {
    const rect = textRect(item);
    const width = Math.min(rect.right, view.right) - Math.max(rect.left, view.left);
    const height = Math.min(rect.bottom, view.bottom) - Math.max(rect.top, view.top);
    return height > 1 && width > 0 ? Math.round(width / ch) : 0;
  });
}

function typedRight(screen: Screen) {
  const view = typeWindow(screen).getBoundingClientRect();
  const visible = visibleChars(screen);
  const index = visible.findIndex((count) => count > 0);
  if (index < 0) return null;
  const rect = textRect(typedItems(screen)[index]!);
  return { left: Math.max(rect.left, view.left), right: Math.min(rect.right, view.right) };
}

function typingAnimations() {
  return document
    .getAnimations()
    .filter(
      (animation): animation is CSSAnimation =>
        animation instanceof CSSAnimation &&
        ["home-skills-type-window", "home-skills-type-strip", "home-skills-blink"].includes(
          animation.animationName,
        ),
    );
}

function seekTyping(time: number) {
  for (const animation of typingAnimations()) {
    animation.pause();
    animation.currentTime = time;
  }
}

function shownTiles(panel: Element) {
  const row = panel.querySelector(".panel-content")!.getBoundingClientRect();
  return [...panel.querySelectorAll<HTMLElement>(".skill-tile")].filter(
    (tile) => tile.getBoundingClientRect().top < row.bottom - 1,
  );
}

function expectOneEvenRow(panel: Element) {
  const row = panel.querySelector(".panel-content")!.getBoundingClientRect();
  const tiles = shownTiles(panel).map((tile) => tile.getBoundingClientRect());
  const gaps = tiles.slice(1).map((tile, index) => tile.left - tiles[index]!.right);

  expect(new Set(tiles.map((tile) => Math.round(tile.top))).size).toBe(1);
  near(tiles[0]!.left, row.left);
  near(tiles.at(-1)!.right, row.right);
  for (const gap of gaps) near(gap, gaps[0]!, 0.5);
  expect(getComputedStyle(panel.querySelector(".panel-content")!).overflow).toBe("hidden");
  return { tiles, gaps };
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function fontSize(screen: Screen, selector: string) {
  return Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "My Core Skills 01 Frontend Backend");
  await document.fonts.load('700 1em "Montserrat Alternates"', "Мои навыки Фронтенд");
  await document.fonts.load('300 1em "Martian Mono"', "02 — SKILLS ALSO IN MY TOOLKIT");
  await document.fonts.load('400 1em "Martian Mono"', "MY PROJECTS React Next.js");
  await document.fonts.load(
    '400 1em "Share Tech Mono"',
    "Favorite stack: Vue.js, NestJS and Tauri Vite Webpack",
  );
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
});

afterEach(async () => {
  vi.useRealTimers();
  finishAnimations();
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderCase(item);
    await prefetchThemeLayers(screen);
    setTheme("cyber-sakura");

    const animations = document.getAnimations().filter((animation) => {
      return animation instanceof CSSTransition;
    });
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSAnimation) {
        animation.pause();
        animation.currentTime = 0;
      }
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`switch-${item.name}`, { screenshotOptions: { animations: "allow" } });
  });
});

describe("behavior", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the heading, the description, the action, two panels and the toolkit", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const slide = pick<HTMLElement>(screen, ".home-skills");
    const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");

    expect(slide.tagName).toBe("SECTION");
    expect(slide.id).toBe("skills");
    expect(slide.querySelectorAll("h2")).toHaveLength(1);
    expect(slide.querySelector("h1")).toBeNull();
    expect(pick(screen, ".home-skills-label").textContent).toBe(en.home.skills.label);
    expect(pick(screen, ".home-skills-title").textContent?.replace(/\s+/g, " ").trim()).toBe(
      `${en.home.skills.titleTop} ${en.home.skills.titleAccent}`,
    );
    expect(pick(screen, ".home-skills-accent").textContent).toBe(en.home.skills.titleAccent);
    expect(pick(screen, ".home-skills-description").textContent).toBe(
      description(en.home.skills.description),
    );
    expect(pick(screen, ".home-skills-action").textContent?.trim()).toBe(en.home.skills.all);
    expect(pick(screen, ".home-skills-action").classList.contains("btn")).toBe(true);
    expect(panels).toHaveLength(2);
    expect(panels.every((panel) => panel.classList.contains("panel"))).toBe(true);
    expect(panels.map((panel) => panel.querySelector(".card-title")?.textContent?.trim())).toEqual([
      `01 ${en.home.skills.frontend}`,
      `02 ${en.home.skills.backend}`,
    ]);
    expect(
      panels.map((panel) =>
        [...panel.querySelectorAll(".skill-tile-label")].map((label) => label.textContent),
      ),
    ).toEqual(
      skillPanels.map((panel) => panel.tiles.map((tile) => SKILL_TILE_META[tile.skill].label)),
    );
    expect(pickAll(screen, ".skill-tile")).toHaveLength(tiles.length);
    expect(pick(screen, ".home-skills-decor").getAttribute("aria-hidden")).toBe("true");
  });

  it("lists the toolkit for screen readers and draws the typed items", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const band = pick(screen, ".home-skills-band");

    expect(band.getAttribute("role")).toBe("group");
    expect(band.getAttribute("aria-label")).toBe(en.home.skills.toolkit);
    expect(pick(screen, ".home-skills-band-label").textContent).toBe(en.home.skills.toolkit);
    expect(pick(screen, ".home-skills-toolkit .sr-only").textContent).toBe(
      [...toolkit.static, ...toolkit.typed.map((item) => item.text)].join(", "),
    );
    expect(pickAll(screen, ".home-skills-static").map((item) => item.textContent)).toEqual(
      toolkit.static.map((item) => `${item}·`),
    );
    expect(pickAll(screen, ".home-skills-type").map((item) => item.textContent)).toEqual(
      toolkit.typed.map((item) => item.text),
    );
    expect(pick(screen, ".home-skills-toolkit [aria-hidden='true']")).not.toBeNull();
  });

  it("translates the texts", async () => {
    const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });
    const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");

    expect(pick(screen, ".home-skills-label").textContent).toBe(ru.home.skills.label);
    expect(pick(screen, ".home-skills-title").textContent?.replace(/\s+/g, " ").trim()).toBe(
      `${ru.home.skills.titleTop} ${ru.home.skills.titleAccent}`,
    );
    expect(pick(screen, ".home-skills-description").textContent).toBe(
      description(ru.home.skills.description),
    );
    expect(pick(screen, ".home-skills-action").textContent?.trim()).toBe(ru.home.skills.all);
    expect(panels.map((panel) => panel.querySelector(".card-title")?.textContent?.trim())).toEqual([
      `01 ${ru.home.skills.frontend}`,
      `02 ${ru.home.skills.backend}`,
    ]);
    expect(pick(screen, ".home-skills-band-label").textContent).toBe(ru.home.skills.toolkit);
  });

  it("lays out like the mockup on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");
    const tiles = [...panels[0]!.querySelectorAll<HTMLElement>(".skill-tile")];

    near(box(screen, ".home-slide-body").width, 1280);
    near(box(screen, ".home-skills-title").left, 120);
    near(fontSize(screen, ".home-skills-title"), 46);
    near(fontSize(screen, ".home-skills-label"), 14);
    near(fontSize(screen, ".home-skills-description"), 16);
    near(box(screen, ".home-skills-action").width, 270);
    near(box(screen, ".home-skills-action").height, 60);
    near(box(screen, ".home-skills-action").right, 120);
    near(box(screen, "", panels[0]).left, 120);
    near(box(screen, "", panels[0]).width, 1200);
    near(box(screen, "", panels[0]).height, 240);
    near(box(screen, "", panels[1]).height, 240);
    near(box(screen, "", panels[1]).top - box(screen, "", panels[0]).top, 240 + 16);
    expect(tiles).toHaveLength(9);
    expect(panels[1]!.querySelectorAll(".skill-tile")).toHaveLength(9);
    for (const tile of tiles) {
      near(tile.getBoundingClientRect().width, 108);
      near(tile.getBoundingClientRect().height, 124);
    }
    near(
      tiles[1]!.getBoundingClientRect().left - tiles[0]!.getBoundingClientRect().right,
      (1136 - 9 * 108) / 8,
    );
    near(box(screen, "", tiles[0]).left, 120 + 32);
    near(box(screen, "", tiles.at(-1)).right, 120 + 32);
    near(box(screen, ".home-skills-band").left, 0);
    near(box(screen, ".home-skills-band").right, 0);
    near(box(screen, ".home-skills-band").height, 59, 3);
    near(box(screen, ".home-skills-band").bottom, 0);
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900, tall: true });
    const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");
    const visible = shownTiles(panels[0]!);

    near(box(screen, ".home-skills-title").left, 32);
    near(fontSize(screen, ".home-skills-title"), 56);
    near(fontSize(screen, ".home-skills-description"), 16);
    near(box(screen, "", panels[0]).left, 32);
    near(box(screen, "", panels[0]).width, 704);
    near(box(screen, "", panels[0]).height, 250 * 0.9);
    near(box(screen, "", panels[1]).top - box(screen, "", panels[0]).top, 250 * 0.9 + 32 * 0.9);
    expect(visible).toHaveLength(6);
    near(visible[0]!.getBoundingClientRect().width, 108 * 0.9);
    for (const panel of panels) expectOneEvenRow(panel);
    near(box(screen, ".home-skills-band").left, 0);
    near(box(screen, ".home-skills-band").right, 0);
  });

  it("lays out like the mockup on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780, tall: true });
    const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");
    const visible = shownTiles(panels[0]!);

    near(box(screen, ".home-skills-title").left, 20);
    near(fontSize(screen, ".home-skills-title"), 44);
    near(box(screen, "", panels[0]).left, 20);
    near(box(screen, "", panels[0]).width, 350);
    near(box(screen, "", panels[0]).height, 230);
    near(visible[0]!.getBoundingClientRect().width, 108 * 0.84);
    expect(visible).toHaveLength(3);
    for (const panel of panels) expectOneEvenRow(panel);
    near(box(screen, ".home-skills-band").left, 0);
    near(box(screen, ".home-skills-band").right, 0);
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 1280, height: 800, locale: "en" as const },
    { width: 1024, height: 800, locale: "ru" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 360, height: 740, locale: "ru" as const },
  ])("keeps everything inside the slide at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    const slide = pick(screen, ".home-skills").getBoundingClientRect();
    const parts = [
      ".home-skills-label",
      ".home-skills-title",
      ".home-skills-description",
      ".home-skills-action",
      ".home-skills-panel",
      ".home-skills-band",
      ".home-skills-band-label",
      ".home-skills-toolkit",
    ];

    for (const selector of parts) {
      for (const element of screen.container.querySelectorAll(selector)) {
        const rect = element.getBoundingClientRect();
        expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left - 0.5);
        expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
      }
    }
    for (const panel of pickAll(screen, ".home-skills-panel")) {
      const rect = panel.getBoundingClientRect();
      for (const tile of shownTiles(panel)) {
        const tileRect = tile.getBoundingClientRect();
        expect(tileRect.left).toBeGreaterThanOrEqual(rect.left);
        expect(tileRect.right).toBeLessThanOrEqual(rect.right);
      }
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
  });

  it.each([
    { width: 1440, visible: 9 },
    { width: 1280, visible: 9 },
    { width: 1024, visible: 7 },
    { width: 900, visible: 7 },
    { width: 768, visible: 6 },
    { width: 600, visible: 5 },
    { width: 390, visible: 3 },
    { width: 360, visible: 3 },
  ])("fits $visible tiles in one even row at $width", async ({ width, visible }) => {
    const screen = await renderCase({ width, height: 900, tall: width < 1024 });

    for (const panel of pickAll(screen, ".home-skills-panel")) {
      expect(shownTiles(panel)).toHaveLength(visible);
      const { gaps } = expectOneEvenRow(panel);
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(5);
    }
  });

  it.each(["en", "ru"] as const)(
    "fits the screen below the header at 1440 x 900 in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick(screen, ".home-skills").getBoundingClientRect();
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const main = pick(screen, ".home-skills-main").getBoundingClientRect();
      const band = pick(screen, ".home-skills-band").getBoundingClientRect();

      expect(slide.height).toBe(900);
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(109);
      expect(main.top - slide.top).toBeGreaterThanOrEqual(109);
      expect(band.bottom).toBeLessThanOrEqual(slide.bottom + 0.5);
      expect(band.top).toBeGreaterThanOrEqual(main.bottom - 0.5);
    },
  );

  it.each([
    { width: 1440, height: 900, header: 110 },
    { width: 768, height: 900, header: 94 },
    { width: 390, height: 780, header: 92 },
  ])("starts the content below the header at $width", async (item) => {
    const screen = await renderCase({ ...item, tall: item.width < 1024 });
    const label = pick(screen, ".home-skills-label").getBoundingClientRect();
    const slide = pick(screen, ".home-skills").getBoundingClientRect();

    expect(label.top - slide.top).toBeGreaterThanOrEqual(item.header - 1);
  });

  it("mounts only the layer of the current theme until the theme switch is intended", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(pickAll(screen, ".home-skills-night")).toHaveLength(1);
    expect(screen.container.querySelector(".home-skills-day")).toBeNull();
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = pick<HTMLElement>(screen, ".home-skills-night");
    const day = pick<HTMLElement>(screen, ".home-skills-day");
    const accent = pick<HTMLElement>(screen, ".home-skills-accent");
    const band = pick<HTMLElement>(screen, ".home-skills-band");
    const type = pick<HTMLElement>(screen, ".home-skills-type");
    const cursor = pick<HTMLElement>(screen, ".home-skills-cursor");
    const panel = pick<HTMLElement>(screen, ".home-skills-panel");
    const frame = panel.querySelector<HTMLElement>(".card-frame")!;

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");
    const darkShape = getComputedStyle(frame, "::before").clipPath;

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(accent, "--home-skills-accent-via")).toBe(true);
    expect(transitioning(band, "--home-skills-band-to")).toBe(true);
    expect(transitioning(band, "box-shadow")).toBe(true);
    expect(transitioning(band, "border-top-color")).toBe(true);
    expect(transitioning(band, "border-bottom-color")).toBe(true);
    expect(transitioning(type, "color")).toBe(true);
    expect(transitioning(cursor, "background-color")).toBe(true);
    expect(transitioning(frame, "clip-path", "::before")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
    expect(getComputedStyle(frame, "::before").clipPath).not.toBe(darkShape);

    await advance(600);
    await expect.poll(() => layerCount(screen)).toBe(1);
    expect(night.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
  });

  it("types the toolkit with a window, a strip and a cursor instead of one animation per item", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const typing = pick<HTMLElement>(screen, ".home-skills-typing");
    const view = typeWindow(screen);
    const strip = pick<HTMLElement>(screen, ".home-skills-type-strip");
    const cursor = pick<HTMLElement>(screen, ".home-skills-cursor");
    const animations = typingAnimations();
    const byTarget = (element: Element) =>
      animations
        .filter((animation) => (animation.effect as KeyframeEffect).target === element)
        .map((animation) => animation.animationName)
        .sort();

    expect(typedItems(screen)).toHaveLength(toolkit.typed.length);
    expect(strip.parentElement).toBe(view);
    expect(view.parentElement).toBe(typing);
    expect(cursor.parentElement).toBe(typing);
    expect(animations).toHaveLength(4);
    expect(byTarget(view)).toEqual(["home-skills-type-window"]);
    expect(byTarget(strip)).toEqual(["home-skills-type-strip"]);
    expect(byTarget(cursor)).toEqual(["home-skills-blink", "home-skills-type-window"]);
    for (const item of typedItems(screen)) expect(byTarget(item)).toEqual([]);
    const cyclic = animations.filter((item) => item.animationName !== "home-skills-blink");
    for (const animation of cyclic) {
      expect(Number(animation.effect?.getComputedTiming().duration)).toBeCloseTo(typingCycle, 0);
      expect(Number(animation.effect?.getComputedTiming().iterations)).toBe(Infinity);
    }
    expect(getComputedStyle(view).overflow).toBe("hidden");
    expect(getComputedStyle(view).getPropertyValue("--home-skills-type-max").trim()).toBe(
      String(Math.max(...toolkit.typed.map((item) => item.text.length))),
    );
    expect(getComputedStyle(view).getPropertyValue("--home-skills-type-first").trim()).toBe(
      String(toolkit.typed[0]!.text.length),
    );
  });

  it("types the toolkit items one after another and moves the cursor with the text", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const cursor = pick<HTMLElement>(screen, ".home-skills-cursor");
    const ch = charWidth(screen);
    const length = (index: number) => toolkit.typed[index]!.text.length;
    const only = (index: number, count: number) =>
      toolkit.typed.map((_, position) => (position === index ? count : 0));
    const gap = () => cursor.getBoundingClientRect().left - typedRight(screen)!.right;

    seekTyping(0);
    expect(visibleChars(screen)).toEqual(only(0, 0));

    seekTyping(100);
    expect(visibleChars(screen)).toEqual(only(0, 1));
    const anchor = typedRight(screen)!.left;
    near(gap(), Number.parseFloat(getComputedStyle(cursor).marginLeft), 1);

    seekTyping(heldAt(0));
    expect(visibleChars(screen)).toEqual(only(0, length(0)));
    near(typedRight(screen)!.left, anchor);
    near(typedRight(screen)!.right - anchor, length(0) * ch);
    near(gap(), Number.parseFloat(getComputedStyle(cursor).marginLeft), 1);

    seekTyping(typingSlots[0]!.erased + PAUSE_MS / 2);
    expect(visibleChars(screen)).toEqual(only(0, 0));

    seekTyping(heldAt(1));
    expect(visibleChars(screen)).toEqual(only(1, length(1)));
    near(typedRight(screen)!.left, anchor);
    near(gap(), Number.parseFloat(getComputedStyle(cursor).marginLeft), 1);

    const last = toolkit.typed.length - 1;
    seekTyping(heldAt(last));
    expect(visibleChars(screen)).toEqual(only(last, length(last)));
    near(typedRight(screen)!.left, anchor);
    near(gap(), Number.parseFloat(getComputedStyle(cursor).marginLeft), 1);

    seekTyping(400);
    expect(getComputedStyle(cursor).opacity).toBe("1");
    seekTyping(700);
    expect(getComputedStyle(cursor).opacity).toBe("0");
  });

  it.each(["en", "ru"] as const)(
    "types every toolkit item to its full length and shows one item at a time in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const typed = buildToolkit(additionalOf(groupsOf[locale])).typed;
      const longest = typed.map(() => 0);
      const order: number[] = [];

      for (let time = 0; time < typingCycle; time += 60) {
        seekTyping(time);
        const visible = visibleChars(screen);
        const shown = visible.flatMap((count, index) => (count > 0 ? [index] : []));

        expect(shown.length, `${time}`).toBeLessThanOrEqual(1);
        for (const index of shown) {
          longest[index] = Math.max(longest[index]!, visible[index]!);
          if (order.at(-1) !== index) order.push(index);
        }
      }

      expect(longest).toEqual(typed.map((item) => item.text.length));
      expect(order).toEqual(typed.map((_, index) => index));
    },
  );

  it("keeps the typing paused until the page has loaded and the line is on the screen", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const typing = pick<HTMLElement>(screen, ".home-skills-typing");

    await waitDecorReady(screen);
    expect(typing.classList).not.toContain("decor-paused");
    expect(typingAnimations().every((animation) => animation.playState === "running")).toBe(true);
    screen.unmount();

    window.scrollTo({ top: 0, behavior: "instant" });
    try {
      const hidden = await renderCase({ width: 1440, height: 900 }, undefined, 3000);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      expect(pick(hidden, ".home-skills-typing").classList).toContain("decor-paused");
      expect(typingAnimations().every((animation) => animation.playState === "paused")).toBe(true);

      pick(hidden, ".home-skills-typing").scrollIntoView({ behavior: "instant" });
      await waitDecorReady(hidden);
      expect(typingAnimations().every((animation) => animation.playState === "running")).toBe(true);
    } finally {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  });

  describe("data", () => {
    it("draws the panel tiles from the groups of the data", async () => {
      const data = structuredClone(groupsOf.en);
      const backend = data.find((group) => group.id === "backend")!;
      const removed = skillPanels[1]!.tiles[0]!.skill;
      backend.skills = backend.skills.filter((skill) => skill.id !== skillTileId(removed));
      const screen = await renderCase({ width: 1440, height: 900 }, data);
      const panels = pickAll<HTMLElement>(screen, ".home-skills-panel");

      expect(panels[0]!.querySelectorAll(".skill-tile")).toHaveLength(skillPanels[0]!.tiles.length);
      expect(panels[1]!.querySelectorAll(".skill-tile")).toHaveLength(
        skillPanels[1]!.tiles.length - 1,
      );
      expect(
        [...panels[1]!.querySelectorAll(".skill-tile-label")].map((label) => label.textContent),
      ).not.toContain(SKILL_TILE_META[removed].label);
    });

    it.each([
      { width: 1440, height: 900 },
      { width: 768, height: 900 },
      { width: 390, height: 780 },
    ])("keeps the toolkit on one line at $width", async (item) => {
      const screen = await renderCase(item);
      const line = pick(screen, ".home-skills-line").getBoundingClientRect();
      const statics = pick(screen, ".home-skills-statics");
      const lineHeight = Number.parseFloat(getComputedStyle(statics).lineHeight);
      const typing = pick(screen, ".home-skills-typing").getBoundingClientRect();
      const shown = pickAll(screen, ".home-skills-static").filter(
        (item) => item.getBoundingClientRect().top < statics.getBoundingClientRect().bottom,
      );

      near(line.height, lineHeight, 1);
      expect(getComputedStyle(statics).overflow).toBe("hidden");
      expect(shown.length).toBeGreaterThan(0);
      for (const item of shown) near(item.getBoundingClientRect().top, line.top, 1);
      near(typing.top, line.top, 1);
      expect(typing.right).toBeLessThanOrEqual(line.right + 0.5);
      expect(line.right - typing.right).toBeLessThan(
        Number.parseFloat(getComputedStyle(statics).fontSize) * 20,
      );
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
    });

    it("takes the toolkit from the additional group of the data", async () => {
      const data = structuredClone(groupsOf.en);
      additionalOf(data)[0]!.name = "Vite 7";
      additionalOf(data)[TOOLKIT_STATIC_COUNT]!.name = "Sass 2";
      const screen = await renderCase({ width: 1440, height: 900 }, data);

      expect(pickAll(screen, ".home-skills-static")[0]!.textContent).toBe("Vite 7·");
      expect(pickAll(screen, ".home-skills-type")[0]!.textContent).toBe("Sass 2");
      expect(pick(screen, ".home-skills-toolkit .sr-only").textContent).toContain(
        "Vite 7, Webpack",
      );
    });

    it(`shows only the first ${TOOLKIT_STATIC_COUNT + TOOLKIT_TYPED_COUNT} skills of the additional group in the toolkit band`, async () => {
      const additional = additionalOf(groupsOf.en);
      const screen = await renderCase({ width: 1440, height: 900 });

      expect(pickAll(screen, ".home-skills-static")).toHaveLength(TOOLKIT_STATIC_COUNT);
      expect(pickAll(screen, ".home-skills-type")).toHaveLength(
        Math.min(TOOLKIT_TYPED_COUNT, additional.length - TOOLKIT_STATIC_COUNT),
      );
      screen.unmount();

      const data = structuredClone(groupsOf.en);
      const extra = Array.from(
        { length: TOOLKIT_STATIC_COUNT + TOOLKIT_TYPED_COUNT },
        (_, index) => ({
          ...additional[0]!,
          id: `extra-${index}`,
          name: `Extra ${index}`,
        }),
      );
      additionalOf(data).push(...extra);
      const long = await renderCase({ width: 1440, height: 900 }, data);

      expect(pickAll(long, ".home-skills-static")).toHaveLength(TOOLKIT_STATIC_COUNT);
      expect(pickAll(long, ".home-skills-type")).toHaveLength(TOOLKIT_TYPED_COUNT);
    });
  });

  describe("all skills window", () => {
    const allDialog = () => document.querySelector<HTMLDialogElement>("dialog.home-skills-all");

    beforeEach(async () => {
      await page.elementLocator(document.body).hover({ position: { x: 4, y: 4 } });
    });

    async function openAll(screen: Screen) {
      await userEvent.click(page.elementLocator(pick(screen, ".home-skills-action")));
      await expect.poll(() => allDialog()?.open, { timeout: 15000 }).toBe(true);
      finishAnimations();
      await expect.poll(() => allDialog()?.dataset.state).toBe("open");
      return allDialog()!;
    }

    async function closeAll() {
      await expect.poll(() => allDialog()?.dataset.state).toBe("closing");
      finishAnimations();
      await expect.poll(() => allDialog()?.open ?? false).toBe(false);
    }

    function groupsIn(dialog: Element) {
      return [...dialog.querySelectorAll(".home-skills-all-group")].map((group) => ({
        name: group.querySelector(".home-skills-all-name")!.textContent?.trim(),
        count: group.querySelector(".home-skills-all-count")!.textContent?.trim(),
        index: group.querySelector(".home-skills-all-index")!.textContent?.trim(),
        skills: [...group.querySelectorAll(".home-skills-all-chip")].map((chip) =>
          chip.textContent?.trim(),
        ),
      }));
    }

    it("keeps the window and its content out of the DOM until the button is pressed", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const button = pick(screen, ".home-skills-action");

      expect(button.getAttribute("aria-haspopup")).toBe("dialog");
      expect(allDialog()).toBeNull();
      expect(document.querySelectorAll(".home-skills-all-group")).toHaveLength(0);
      expect(document.querySelectorAll(".home-skills-all-chip")).toHaveLength(0);

      await openAll(screen);
      expect(document.querySelectorAll(".home-skills-all-group")).toHaveLength(4);

      await userEvent.keyboard("{Escape}");
      await closeAll();
      expect(document.querySelectorAll(".home-skills-all-group")).toHaveLength(0);
      expect(document.querySelectorAll(".home-skills-all-chip")).toHaveLength(0);
    });

    it("lists every skill of the four groups at once, with the names of the data as they are", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const dialog = await openAll(screen);
      const groups = groupsOf.en;

      expect(groups.map((group) => group.id)).toEqual([...SKILL_GROUP_IDS]);
      expect(groupsIn(dialog)).toEqual(
        groups.map((group, index) => ({
          name: group.name,
          count: String(group.skills.length),
          index: String(index + 1).padStart(2, "0"),
          skills: group.skills.map((skill) => skill.name),
        })),
      );
      expect(dialog.querySelectorAll(".home-skills-all-chip")).toHaveLength(
        groups.reduce((sum, group) => sum + group.skills.length, 0),
      );
      expect(dialog.querySelectorAll(".home-skills-all-list")).toHaveLength(4);
    });

    it("names the window, its description and its close button", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const dialog = await openAll(screen);
      const title = dialog.querySelector("h2")!;

      expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
      expect(title.textContent?.replace(/\s+/g, " ").trim()).toBe(
        `${en.home.skills.modal.title} ${en.home.skills.modal.accent}`,
      );
      expect(dialog.querySelector(".modal-label")!.textContent).toBe(en.home.skills.label);
      expect(dialog.querySelector(".modal-description")!.textContent).toBe(
        en.home.skills.modal.description,
      );
      expect(dialog.querySelector(".modal-close")!.getAttribute("aria-label")).toBe(
        en.home.skills.modal.close,
      );
      expect(dialog.querySelectorAll("h3")).toHaveLength(4);
      for (const group of dialog.querySelectorAll("section")) {
        const heading = group.querySelector("h3")!;
        expect(group.getAttribute("aria-labelledby")).toBe(heading.id);
      }
    });

    it("moves the focus into the window and returns it to the button on Escape", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const button = pick<HTMLElement>(screen, ".home-skills-action");
      const dialog = await openAll(screen);

      expect(dialog.contains(document.activeElement)).toBe(true);
      await userEvent.keyboard("{Escape}");
      await closeAll();

      expect(document.activeElement).toBe(button);
    });

    it("closes with the close button, returns the focus to the button and opens again", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const button = pick<HTMLElement>(screen, ".home-skills-action");
      const dialog = await openAll(screen);

      await userEvent.click(page.elementLocator(dialog.querySelector(".modal-close")!));
      await closeAll();

      expect(document.activeElement).toBe(button);
      await openAll(screen);
      expect(document.querySelectorAll(".home-skills-all-group")).toHaveLength(4);
    });

    it("marks the technical groups as English terms and leaves the lead group alone", async () => {
      const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });
      const dialog = await openAll(screen);
      const groups = [...dialog.querySelectorAll(".home-skills-all-group")];

      expect(
        groups.map((group) => group.querySelector<HTMLElement>(".home-skills-all-name")!.lang),
      ).toEqual(["en", "en", "", "en"]);
      for (const index of [0, 1, 3]) {
        for (const chip of groups[index]!.querySelectorAll(".home-skills-all-chip")) {
          expect(chip.getAttribute("lang")).toBe("en");
          expect(chip.hasAttribute("data-atom-skip")).toBe(true);
        }
      }
      for (const chip of groups[2]!.querySelectorAll(".home-skills-all-chip")) {
        expect(chip.hasAttribute("lang")).toBe(false);
        expect(chip.hasAttribute("data-atom-skip")).toBe(false);
      }
    });

    it("takes the service texts and the lead group of the language", async () => {
      const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });
      const dialog = await openAll(screen);
      const lead = groupsOf.ru.find((group) => group.id === "lead")!;

      expect(dialog.querySelector("h2")!.textContent?.replace(/\s+/g, " ").trim()).toBe(
        `${ru.home.skills.modal.title} ${ru.home.skills.modal.accent}`,
      );
      expect(dialog.querySelector(".modal-close")!.getAttribute("aria-label")).toBe(
        ru.home.skills.modal.close,
      );
      expect(groupsIn(dialog)[2]).toEqual({
        name: lead.name,
        count: String(lead.skills.length),
        index: "03",
        skills: lead.skills.map((skill) => skill.name),
      });
    });

    it("scrolls inside the window on a narrow screen and keeps the window on the screen", async () => {
      const screen = await renderCase({ width: 390, height: 780 });
      const dialog = await openAll(screen);
      const body = dialog.querySelector<HTMLElement>(".modal-body")!;
      const frame = dialog.querySelector<HTMLElement>(".modal-window")!.getBoundingClientRect();

      expect(getComputedStyle(body).overflowY).toBe("auto");
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      expect(frame.top).toBeGreaterThanOrEqual(0);
      expect(frame.bottom).toBeLessThanOrEqual(780);
      expect(frame.left).toBeGreaterThanOrEqual(0);
      expect(frame.right).toBeLessThanOrEqual(390);
      for (const chip of dialog.querySelectorAll(".home-skills-all-chip")) {
        expect(chip.getBoundingClientRect().right).toBeLessThanOrEqual(
          body.getBoundingClientRect().right,
        );
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    });

    it.each([
      { width: 1440, height: 900, columns: 2 },
      { width: 768, height: 900, columns: 1 },
      { width: 390, height: 780, columns: 1 },
    ])("puts the groups in $columns column(s) at $width", async ({ width, height, columns }) => {
      const screen = await renderCase({ width, height });
      const dialog = await openAll(screen);
      const lefts = new Set(
        [...dialog.querySelectorAll(".home-skills-all-group")].map((group) =>
          Math.round(group.getBoundingClientRect().left),
        ),
      );

      expect(lefts.size).toBe(columns);
    });

    it("animates a chip on hover", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const dialog = await openAll(screen);
      const chip = dialog.querySelector<HTMLElement>(".home-skills-all-chip")!;
      const before = getComputedStyle(chip).translate;
      const fill = getComputedStyle(chip, "::before").backgroundColor;

      await userEvent.hover(page.elementLocator(chip));

      expect(transitioning(chip, "translate")).toBe(true);
      expect(transitioning(chip, "color")).toBe(true);
      expect(transitioning(chip, "background-color", "::before")).toBe(true);
      finishAnimations();
      expect(getComputedStyle(chip).translate).not.toBe(before);
      expect(getComputedStyle(chip, "::before").backgroundColor).not.toBe(fill);

      await userEvent.unhover(page.elementLocator(chip));
      finishAnimations();
      expect(getComputedStyle(chip).translate).toBe(before);
    });

    it("does not animate a chip when motion is reduced", async () => {
      await setReducedMotion("reduce");
      const screen = await renderCase({ width: 1440, height: 900 });
      const dialog = await openAll(screen);
      const chip = dialog.querySelector<HTMLElement>(".home-skills-all-chip")!;
      const before = getComputedStyle(chip).translate;

      await userEvent.hover(page.elementLocator(chip));

      expect(transitioning(chip, "translate")).toBe(false);
      expect(transitioning(chip, "background-color", "::before")).toBe(false);
      expect(getComputedStyle(chip).translate).not.toBe(before);
    });

    it("follows the theme while the window is open", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const dialog = await openAll(screen);
      const title = dialog.querySelector<HTMLElement>(".home-skills-all-title")!;
      const line = getComputedStyle(title).borderBottomColor;

      setTheme("cyber-sakura");

      expect(transitioning(title, "border-bottom-color")).toBe(true);
      finishAnimations();
      expect(getComputedStyle(title).borderBottomColor).not.toBe(line);
    });
  });

  describe("skill swap", () => {
    it("starts with the first skill on every tile and swaps nothing before the first moment", async () => {
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      await waitSwapTimers(before);
      const first = tiles.map((tile) => SKILL_TILE_META[tile.skill].label);

      expect(tileLabels(screen)).toEqual(first);
      await advance(Math.min(...tiles.map((tile) => swapTime(tile))) - 1);
      expect(tileLabels(screen)).toEqual(first);
    });

    it("swaps one tile per step: frontend 1, backend 2, frontend 3 and so on, then backend 1, frontend 2, and back again every 16 s", async () => {
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      await waitSwapTimers(before);
      const first = tiles.map((tile) => SKILL_TILE_META[tile.skill].label);
      const second = tiles.map((tile) => SKILL_TILE_META[tile.swap].label);
      const expected = walk();
      let previous = 0;

      expect(first.some((label, index) => label !== second[index])).toBe(true);
      expect(expected).toHaveLength(18);
      expect(expected.slice(0, 5)).toEqual([0, 10, 2, 12, 4]);
      expect(expected.slice(9, 14)).toEqual([9, 1, 11, 3, 13]);
      for (const cycle of [0, 1]) {
        const moments = expected.map((index) => swapTime(tiles[index]!, cycle));

        expect(moments).toEqual([...new Set(moments)].sort((a, b) => a - b));
        for (const [step, moment] of moments.entries()) {
          await advance(moment - 1 - previous);
          const before = tileLabels(screen);
          await advance(1);
          previous = moment;
          const after = tileLabels(screen);
          const changed = after.flatMap((label, index) => (label === before[index] ? [] : [index]));
          const index = expected[step]!;

          expect(changed).toEqual(first[index] === second[index] ? [] : [index]);
          expect(after[index]).toBe(cycle === 0 ? second[index] : first[index]);
        }
        expect(tileLabels(screen)).toEqual(cycle === 0 ? second : first);
      }
    });

    it("keeps one readable layer per tile and never uses a live region", async () => {
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      await waitSwapTimers(before);
      const tile = pickAll(screen, ".skill-tile")[0]!;

      await advance(swapTime(tiles[0]!));
      const layers = [...tile.querySelectorAll(".skill-tile-layer")];
      const readable = layers.filter((layer) => layer.getAttribute("aria-hidden") === null);

      expect(layers).toHaveLength(2);
      expect(readable).toHaveLength(1);
      expect(readable[0]!.textContent).toBe(SKILL_TILE_META[tiles[0]!.swap].label);
      expect(layers.find((layer) => layer !== readable[0])!.getAttribute("aria-hidden")).toBe(
        "true",
      );
      expect(screen.container.querySelector("[aria-live]")).toBeNull();
      expect(screen.container.querySelector("[role='status']")).toBeNull();
      finishAnimations();
      await expect.poll(() => tile.querySelectorAll(".skill-tile-layer").length).toBe(1);
    });

    it("stops every timer when the section is unmounted", async () => {
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      await waitSwapTimers(before);

      expect(vi.getTimerCount() - before).toBeGreaterThanOrEqual(tiles.length);
      await advance(SKILL_SWAP_PERIOD / 2);
      expect(vi.getTimerCount() - before).toBeGreaterThanOrEqual(tiles.length);
      screen.unmount();
      await nextTick();

      expect(vi.getTimerCount()).toBe(before);
    });

    it("waits for the panels to come on the screen and stops while they are off it", async () => {
      const before = vi.getTimerCount();
      const first = tiles.map((tile) => SKILL_TILE_META[tile.skill].label);
      window.scrollTo({ top: 0, behavior: "instant" });
      try {
        const screen = await renderCase({ width: 1440, height: 900 }, undefined, 3000);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        expect(pick(screen, ".home-skills-typing").classList).toContain("decor-paused");
        expect(vi.getTimerCount()).toBe(before);
        await advance(SKILL_SWAP_PERIOD);
        expect(tileLabels(screen)).toEqual(first);

        pick(screen, ".home-skills-panels").scrollIntoView({ behavior: "instant" });
        await waitSwapTimers(before);
        await advance(Math.min(...tiles.map((tile) => swapTime(tile))));
        expect(tileLabels(screen)).not.toEqual(first);

        window.scrollTo({ top: 0, behavior: "instant" });
        await expect.poll(() => vi.getTimerCount()).toBe(before);
      } finally {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });

    it("does not start the swap on the server", async () => {
      const app = createSSRApp({ render: () => h(Skills, { groups: groupsOf.en }) });
      app.use(createApp("en"));
      const before = vi.getTimerCount();
      await renderToString(app);

      expect(vi.getTimerCount()).toBe(before);
    });
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("keeps the first skill on every tile and starts no timers", async () => {
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      await waitDecorReady(screen);

      expect(vi.getTimerCount()).toBe(before);
      await advance(SKILL_SWAP_PERIOD * 3);
      expect(tileLabels(screen)).toEqual(tiles.map((tile) => SKILL_TILE_META[tile.skill].label));
      expect(pickAll(screen, ".skill-tile-layer")).toHaveLength(tiles.length);
    });

    it("returns to the first skill and stops the timers when motion gets reduced", async () => {
      await setReducedMotion("no-preference");
      const before = vi.getTimerCount();
      const screen = await renderCase({ width: 1440, height: 900 });
      const backendTile = 10;
      await waitSwapTimers(before);

      await advance(swapTime(tiles[backendTile]!));
      expect(tileLabels(screen)[backendTile]).toBe(SKILL_TILE_META[tiles[backendTile]!.swap].label);
      const running = vi.getTimerCount();

      await setReducedMotion("reduce");
      await expect
        .poll(() => tileLabels(screen)[backendTile])
        .toBe(SKILL_TILE_META[tiles[backendTile]!.skill].label);
      expect(vi.getTimerCount()).toBeLessThan(running);
      await advance(SKILL_SWAP_PERIOD * 3);
      expect(tileLabels(screen)).toEqual(tiles.map((tile) => SKILL_TILE_META[tile.skill].label));
    });

    it("stops the typing and keeps the first item and the cursor visible", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const cursor = pick<HTMLElement>(screen, ".home-skills-cursor");
      const first = toolkit.typed[0]!.text.length;

      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(typeWindow(screen)).transform).toBe("none");
      expect(getComputedStyle(pick(screen, ".home-skills-type-strip")).transform).toBe("none");
      expect(visibleChars(screen)).toEqual(toolkit.typed.map((_, index) => (index ? 0 : first)));
      near(
        cursor.getBoundingClientRect().left - typedRight(screen)!.left,
        first * charWidth(screen) + Number.parseFloat(getComputedStyle(cursor).marginLeft),
      );
      expect(getComputedStyle(cursor).opacity).toBe("1");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = pick<HTMLElement>(screen, ".home-skills-night");

      setTheme("cyber-sakura");
      await nextTick();
      for (const selector of customTransitions) {
        for (const element of screen.container.querySelectorAll(selector)) {
          expect(
            document
              .getAnimations()
              .some((animation) => (animation.effect as KeyframeEffect).target === element),
            selector,
          ).toBe(false);
        }
      }
      expect(getComputedStyle(night).opacity).toBe("0");
      expect(getComputedStyle(night).visibility).toBe("hidden");
    });
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Skills, { groups: groupsOf.en }) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="skills"');
    expect(html).toContain("home-skills-title");
    expect(html).toContain("My Core");
    expect(html.match(/home-skills-type /g)).toHaveLength(toolkit.typed.length);
    expect(html.match(/skill-tile-label/g)).toHaveLength(tiles.length);
  });
});
