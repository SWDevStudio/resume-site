import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildProjects } from "~/assets/api/mock/build";
import { loadProjectMedia } from "~/assets/api/mock/media";
import { staticSources } from "~/assets/api/mock/sources.static";
import type { Locale } from "~/assets/const";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import Projects from "./Projects.vue";
import { cycleTones } from "./projects";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface ProjectsCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
  tall?: number;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: ProjectsCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: ProjectsCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const customTransitions = [
  ".home-projects-night",
  ".home-projects-day",
  ".home-projects-accent",
  ".home-projects-dot",
  ".home-projects-live",
  ".home-projects-read",
  ".home-projects-all",
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

const CARD_PROJECTS = ["dobro", "hector", "brendmart", "tamriel-codex"];

const media = await loadProjectMedia();

function cardSources(locale: Locale, ids = CARD_PROJECTS) {
  const sources = staticSources(locale);
  return {
    ...sources,
    media,
    projects: sources.projects.filter((project) => ids.includes(project.id)),
  };
}

const lists = {
  en: buildProjects(cardSources("en"), "en"),
  ru: buildProjects(cardSources("ru"), "ru"),
};

const qwixitLists = {
  en: buildProjects(cardSources("en", ["qwixit"]), "en"),
  ru: buildProjects(cardSources("ru", ["qwixit"]), "ru"),
};

const toneTokens = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  accent: "--color-accent",
};

function cover(project: (typeof lists.en)[number]) {
  return project.preview ?? project.previewMobile;
}

const CARD_TAGS = 3;

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-projects-night, .home-projects-day").length;
}

async function prefetchThemeLayers(screen: { container: HTMLElement }) {
  useThemeLayersPrefetch().prefetch();
  await expect.poll(() => layerCount(screen)).toBe(2);
  screen.container.getBoundingClientRect();
}

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

async function renderCase(
  item: Pick<ProjectsCase, "width" | "height" | "locale" | "tall">,
  source = lists,
) {
  await page.viewport(item.width, item.tall ?? item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h(
        "div",
        { class: "bg-base-100 font-body text-base-content" },
        h(Projects, { projects: source[locale] }),
      ),
    { global: { plugins: [createApp(locale)] } },
  );
  await expect.poll(() => layerCount(screen)).toBe(1);
  if (item.tall !== undefined) {
    screen.container.querySelector<HTMLElement>(".home-projects")!.style.minHeight = "0";
  }
  screen.container.getBoundingClientRect();
  await Promise.all(
    [...screen.container.querySelectorAll("img")].map((image) => image.decode().catch(() => {})),
  );
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderCase>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function box(screen: Screen, selector: string) {
  const slide = pick(screen, ".home-projects").getBoundingClientRect();
  const rect = pick(screen, selector).getBoundingClientRect();
  return {
    left: rect.left - slide.left,
    top: rect.top - slide.top,
    right: slide.right - rect.right,
    bottom: slide.bottom - rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

async function drag(screen: Screen, distance: number) {
  const viewport = pick<HTMLElement>(screen, ".home-projects-viewport");
  const rect = viewport.getBoundingClientRect();
  const y = rect.top + rect.height / 2;
  const from = rect.left + rect.width / 2;
  const mouse = (type: string, x: number) =>
    new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });

  viewport.dispatchEvent(mouse("mousedown", from));
  for (let step = 1; step <= 10; step++) {
    document.dispatchEvent(mouse("mousemove", from + (distance * step) / 10));
    await new Promise((done) => setTimeout(done, 16));
  }
  document.dispatchEvent(mouse("mouseup", from + distance));
}

function activeDot(screen: Screen) {
  return pickAll(screen, ".home-projects-dot").findIndex((dot) =>
    dot.classList.contains("home-projects-dot-active"),
  );
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function size(screen: Screen, selector: string) {
  return Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function resolve(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

const dictionaries = { en, ru };

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load(
    '400 1em "Righteous"',
    "My Projects Dobro.rf Hector Brendmart Tamriel Codex Qwixit",
  );
  await document.fonts.load('700 1em "Montserrat Alternates"', "Мои проекты");
  await document.fonts.load('300 1em "Martian Mono"', "04 — PROJECTS FASHION MARKETPLACE");
  await document.fonts.load('400 1em "Martian Mono"', "Read case LIVE SITE Читать кейс");
  await document.fonts.load('400 1em "Share Tech Mono"', "Selected work: e-commerce and booking");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
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

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
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

  it.each(["en", "ru"] as const)(
    "renders the heading and four project cards in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick<HTMLElement>(screen, ".home-projects");
      const dictionary = dictionaries[locale].home.projects;
      const list = lists[locale];
      const cards = pickAll(screen, ".home-projects-card");

      expect(slide.tagName).toBe("SECTION");
      expect(slide.id).toBe("projects");
      expect(slide.querySelectorAll("h2")).toHaveLength(1);
      expect(slide.querySelector("h1")).toBeNull();
      expect(pick(screen, ".home-projects-label").textContent).toBe(dictionary.label);
      expect(text(pick(screen, ".home-projects-title"))).toBe(
        `${dictionary.titleTop} ${dictionary.titleAccent}`,
      );
      expect(pick(screen, ".home-projects-accent").textContent).toBe(dictionary.titleAccent);
      expect(pick(screen, ".home-projects-description").textContent).toBe(dictionary.description);
      expect(cards).toHaveLength(4);
      expect(cards.map((item) => text(item.querySelector(".card-title")))).toEqual([
        "01 Dobro.rf",
        "02 Hector",
        "03 Brendmart",
        "04 Tamriel Codex",
      ]);
      expect(cards.map((item) => text(item.querySelector(".card-subtitle")))).toEqual(
        list.map((project) => project.subtitle),
      );
      expect(cards.map((item) => text(item.querySelector(".card-text")))).toEqual(
        list.map((project) => project.description),
      );
      expect(
        cards.map((item) => [...item.querySelectorAll(".card-tag")].map((tag) => text(tag))),
      ).toEqual(list.map((project) => project.tags.slice(0, CARD_TAGS)));
      expect(cards.map((item) => item.querySelector("img")!.getAttribute("alt"))).toEqual(
        list.map((project) => project.previewAlt),
      );
      expect(pickAll(screen, ".home-projects-read").map((item) => text(item))).toEqual(
        Array(4).fill(dictionary.readCase),
      );
      expect(pickAll(screen, ".home-projects-live").map((item) => text(item))).toEqual(
        Array(4).fill(dictionary.liveSite),
      );
      expect(cards.every((item) => item.classList.contains("folder"))).toBe(true);
      expect(pick(screen, ".home-projects-decor").getAttribute("aria-hidden")).toBe("true");
    },
  );

  it("shows the four project previews", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const images = pickAll<HTMLImageElement>(screen, ".card-media-image");

    expect(images).toHaveLength(4);
    for (const image of images) {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
    }
    expect(new Set(images.map((image) => image.src)).size).toBe(4);
    expect(images.map((image) => image.getAttribute("src"))).toEqual(
      lists.en.map((project) => cover(project)?.src),
    );
    expect(images.map((image) => image.getAttribute("srcset"))).toEqual(
      lists.en.map((project) =>
        cover(project)
          ?.variants.map((variant) => `${variant.src} ${variant.width}w`)
          .join(", "),
      ),
    );
    expect(lists.en.every((project) => (cover(project)?.variants.length ?? 0) > 1)).toBe(true);
    expect(images.every((image) => image.getAttribute("sizes"))).toBe(true);
  });

  it("crops the phone preview of a project without a desktop preview from the top", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".home-projects-card");

    expect(lists.en.map((project) => project.preview === null)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    expect(cards.map((card) => card.classList.contains("home-projects-card-phone"))).toEqual([
      false,
      true,
      false,
      false,
    ]);
    expect(
      cards.map(
        (card) => getComputedStyle(card.querySelector(".card-media-image")!).objectPosition,
      ),
    ).toEqual(["50% 50%", "50% 0%", "50% 50%", "50% 50%"]);
  });

  it.each(["en", "ru"] as const)(
    "shows the first three of the four tags of Qwixit in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale }, qwixitLists);
      const qwixit = qwixitLists[locale][0]!;
      const shown = [...pickAll(screen, ".home-projects-card")[0]!.querySelectorAll(".card-tag")];

      expect(qwixit.tags).toHaveLength(4);
      expect(shown.map((tag) => text(tag))).toEqual(qwixit.tags.slice(0, CARD_TAGS));
      expect(shown.map((tag) => text(tag))).not.toContain(qwixit.tags[3]);
    },
  );

  it("builds the cards from the list it gets and nothing else", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const first = pickAll(screen, ".home-projects-card")[0]!;

    expect(first.querySelector("img")!.getAttribute("alt")).toBe(lists.en[0]!.previewAlt);
    expect(pickAll(screen, ".home-projects-dot")).toHaveLength(lists.en.length);
  });

  it("lays out like the mockup on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".home-projects-card").map((item) =>
      item.getBoundingClientRect(),
    );
    const dots = pick(screen, ".home-projects-dots");
    const viewport = pick<HTMLElement>(screen, ".home-projects-viewport");
    const track = pick<HTMLElement>(screen, ".home-projects-track");
    const left = pick(screen, ".home-projects").getBoundingClientRect().left;

    expect(box(screen, ".home-projects").height).toBeGreaterThanOrEqual(900);
    near(
      box(screen, ".home-projects-list").top - box(screen, ".home-projects-head").top,
      box(screen, ".home-projects-head").height + 64,
    );
    near(
      box(screen, ".home-projects-dots").top -
        (box(screen, ".home-projects-viewport").top +
          box(screen, ".home-projects-viewport").height -
          32),
      24,
    );
    near(box(screen, ".home-projects-head").left, 140);
    near(size(screen, ".home-projects-label"), 14);
    near(size(screen, ".home-projects-title"), 64);
    near(size(screen, ".home-projects-description"), 16);
    near(size(screen, ".home-projects-card .card-title"), 28);
    near(size(screen, ".home-projects-card .card-subtitle"), 12);
    near(size(screen, ".home-projects-card .card-text"), 14);
    near(cards[0]!.left - left, 140);
    for (const card of cards) near(card.width, (1160 - 64) / 3);
    near(cards[1]!.left - cards[0]!.right, 32);
    near(cards[2]!.left - cards[1]!.right, 32);
    near(cards[3]!.left - cards[2]!.right, 32);
    near(cards[2]!.right - left, 1300);
    expect(cards[3]!.left - left).toBeGreaterThan(1300);
    expect(cards[0]!.height).toBeGreaterThanOrEqual(cards.at(1)!.height - 1);
    near(cards[0]!.height, cards[3]!.height);
    expect(getComputedStyle(dots).display).toBe("flex");
    expect(
      pickAll(screen, ".home-projects-dot").map((dot) => dot.getBoundingClientRect().width),
    ).toEqual([26, 10, 10, 10]);
    near(box(screen, ".home-projects-read").width, 127, 1);
    expect(getComputedStyle(track).flexDirection).toBe("row");
    expect(getComputedStyle(viewport).overflowX).toBe("hidden");
    near(viewport.getBoundingClientRect().left - left, 140);
    near(viewport.getBoundingClientRect().right - left, 1300);
    expect(track.style.transform).toContain("translate");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
    const viewport = pick<HTMLElement>(screen, ".home-projects-viewport");
    const track = pick<HTMLElement>(screen, ".home-projects-track");
    const cards = pickAll(screen, ".home-projects-card").map((item) =>
      item.getBoundingClientRect(),
    );
    const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");

    near(box(screen, ".home-projects-head").left, 32);
    near(size(screen, ".home-projects-title"), 56);
    near(cards[0]!.width, 330);
    near(cards[0]!.left - pick(screen, ".home-projects").getBoundingClientRect().left, 32);
    near(cards[1]!.left - cards[0]!.right, 32);
    near(cards[1]!.right, 724);
    expect(cards[2]!.left).toBeLessThan(768);
    expect(cards[2]!.left).toBeGreaterThan(740);
    expect(getComputedStyle(viewport).overflowX).toBe("hidden");
    near(viewport.getBoundingClientRect().right, 736);
    expect(track.style.transform).toContain("translate");
    expect(getComputedStyle(pick(screen, ".home-projects-dots")).display).toBe("flex");
    expect(dots.map((dot) => dot.getBoundingClientRect().width)).toEqual([26, 10, 10, 10]);
    near(dots[0]!.getBoundingClientRect().height, 4);
    near(dots[1]!.getBoundingClientRect().left - dots[0]!.getBoundingClientRect().right, 10);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
  });

  it("slides the cards on mobile with the next one peeking from the edge", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const viewport = pick<HTMLElement>(screen, ".home-projects-viewport");
    const cards = pickAll(screen, ".home-projects-card").map((item) =>
      item.getBoundingClientRect(),
    );
    const left = pick(screen, ".home-projects").getBoundingClientRect().left;

    near(box(screen, ".home-projects-head").left, 20);
    near(size(screen, ".home-projects-title"), 44);
    expect(getComputedStyle(pick(screen, ".home-projects-track")).flexDirection).toBe("row");
    expect(getComputedStyle(viewport).overflowX).toBe("hidden");
    near(viewport.getBoundingClientRect().left - left, 0);
    near(viewport.getBoundingClientRect().width, 390);
    expect(pick<HTMLElement>(screen, ".home-projects-track").style.transform).toContain(
      "translate",
    );
    expect(getComputedStyle(pick(screen, ".home-projects-dots")).display).toBe("flex");
    near(cards[0]!.left - left, 20);
    for (const card of cards) near(card.width, 310);
    near(cards[1]!.left - cards[0]!.right, 32);
    near(cards[1]!.top, cards[0]!.top);
    near(390 - (cards[1]!.left - left), 28);
    for (const card of cards) expect(card.height).toBeLessThanOrEqual(520);
    for (const text of pickAll(screen, ".home-projects-card .card-text")) {
      expect(getComputedStyle(text).webkitLineClamp).toBe("3");
    }
    expect(getComputedStyle(pick(screen, ".home-projects-card .card-media")).aspectRatio).toBe(
      "16 / 10",
    );
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it("follows the dragged card on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const left = () => pick(screen, ".home-projects").getBoundingClientRect().left;
    const card = (index: number) =>
      pickAll(screen, ".home-projects-card")[index]!.getBoundingClientRect();

    await drag(screen, -150);
    await vi.waitFor(() => expect(activeDot(screen)).toBe(1));
    await vi.waitFor(() => near(card(1).left - left(), 20, 1), { timeout: 5000 });
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 1024, height: 800, locale: "ru" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 360, height: 740, locale: "ru" as const },
  ])("keeps everything inside the slide at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    const slide = pick(screen, ".home-projects").getBoundingClientRect();
    const viewport = pick(screen, ".home-projects-viewport");
    const clips = getComputedStyle(viewport).overflowX === "hidden";
    const parts = [
      ".home-projects-label",
      ".home-projects-title",
      ".home-projects-description",
      ".home-projects-card",
      ".home-projects-dots",
      ".home-projects-all",
    ];

    for (const selector of parts) {
      for (const element of screen.container.querySelectorAll(selector)) {
        if (clips && selector === ".home-projects-card") continue;
        const rect = element.getBoundingClientRect();
        expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left);
        expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
      }
    }
    const window = viewport.getBoundingClientRect();
    expect(window.left).toBeGreaterThanOrEqual(slide.left);
    expect(window.right).toBeLessThanOrEqual(slide.right + 0.5);
    for (const card of screen.container.querySelectorAll(".home-projects-card")) {
      const area = card.getBoundingClientRect();
      for (const part of card.querySelectorAll(
        ".card-title, .card-text, .card-tags, .folder-actions",
      )) {
        const rect = part.getBoundingClientRect();
        expect(rect.left, part.className).toBeGreaterThanOrEqual(area.left);
        expect(rect.right, part.className).toBeLessThanOrEqual(area.right + 0.5);
        expect(rect.bottom, part.className).toBeLessThanOrEqual(area.bottom + 0.5);
      }
      for (const action of card.querySelectorAll(".home-projects-read, .home-projects-live")) {
        expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth + 1);
      }
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
  });

  it.each(["en", "ru"] as const)(
    "starts below the header and keeps the cards on the slide at 1440 x 900 in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick(screen, ".home-projects").getBoundingClientRect();
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const main = pick(screen, ".home-projects-main").getBoundingClientRect();
      const header = 110;

      expect(slide.height).toBeGreaterThanOrEqual(900);
      expect(main.top - slide.top).toBeGreaterThanOrEqual(header - 1);
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
        header - 1,
      );
      expect(
        pick(screen, ".home-projects-list").getBoundingClientRect().bottom,
      ).toBeLessThanOrEqual(slide.bottom - 24);
      for (const card of pickAll(screen, ".home-projects-card")) {
        expect(card.getBoundingClientRect().bottom).toBeLessThanOrEqual(slide.bottom - 24);
      }
    },
  );

  it.each([
    { width: 1440, height: 900, header: 110 },
    { width: 768, height: 900, header: 94 },
    { width: 390, height: 780, header: 68 },
  ])("starts the content below the header at $width", async (item) => {
    const screen = await renderCase(item);
    const head = pick(screen, ".home-projects-head").getBoundingClientRect();
    const slide = pick(screen, ".home-projects").getBoundingClientRect();

    expect(head.top - slide.top).toBeGreaterThanOrEqual(item.header - 1);
  });

  it("cycles the card colours by position whatever tone the project has", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".home-projects-card");
    const tones = cycleTones(cards.length);

    expect(lists.en.map((project) => project.tone)).toEqual([
      "secondary",
      "primary",
      "secondary",
      "accent",
    ]);
    expect(tones).toEqual(["primary", "secondary", "accent", "secondary"]);
    cards.forEach((card, index) => {
      const token = toneTokens[tones[index]!];
      expect(getComputedStyle(card.querySelector(".card-index")!).color).toBe(
        resolve(`${token}-ink`),
      );
      expect(getComputedStyle(card.querySelector(".card-subtitle")!).color).toBe(
        resolve(`${token}-ink`),
      );
      const accent = getComputedStyle(card).getPropertyValue("--home-projects-accent").trim();
      expect(accent).toBe(
        getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
      );
      expect(getComputedStyle(card).getPropertyValue("--card-mark-color").trim()).toBe(accent);
      expect(getComputedStyle(card).getPropertyValue("--card-side-color").trim()).toBe(accent);
      expect(getComputedStyle(card).getPropertyValue("--folder-glow").trim()).toBe("none");
    });
    expect(
      pickAll(screen, ".home-projects-read").map((item) =>
        ["btn-primary", "btn-secondary", "btn-accent"].find((name) =>
          item.classList.contains(name),
        ),
      ),
    ).toEqual(["btn-primary", "btn-secondary", "btn-accent", "btn-secondary"]);
    expect(
      pickAll(screen, ".home-projects-dot").map((item) =>
        ["primary", "secondary", "accent"].find((name) =>
          item.classList.contains(`home-projects-dot-${name}`),
        ),
      ),
    ).toEqual(["primary", "secondary", "accent", "secondary"]);
  });

  it.each([2, 3, 4, 5, 6, 7, 9, 10, 12])(
    "never puts two cards of one colour next to each other in a loop of %i",
    (count) => {
      const tones = cycleTones(count);

      expect(tones).toHaveLength(count);
      tones.forEach((tone, index) => {
        expect(tone, `${index}`).not.toBe(tones[(index + 1) % count]);
      });
      expect(tones.slice(0, count - 1)).toEqual(
        Array.from(
          { length: count - 1 },
          (_, index) => ["primary", "secondary", "accent"][index % 3],
        ),
      );
    },
  );

  it("mounts only the layer of the current theme until the theme switch is intended", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(pickAll(screen, ".home-projects-night")).toHaveLength(1);
    expect(screen.container.querySelector(".home-projects-day")).toBeNull();
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = pick<HTMLElement>(screen, ".home-projects-night");
    const day = pick<HTMLElement>(screen, ".home-projects-day");
    const accent = pick<HTMLElement>(screen, ".home-projects-accent");
    const frame = pick<HTMLElement>(screen, ".home-projects-card .card-frame");
    const live = pick<HTMLElement>(screen, ".home-projects-read");

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(accent, "--home-projects-accent-via")).toBe(true);
    expect(transitioning(frame, "clip-path", "::before")).toBe(true);
    expect(transitioning(live, "color")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");

    await expect.poll(() => layerCount(screen)).toBe(1);
    expect(night.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
  });

  it("changes the shape of the folder with the theme", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const frame = pick<HTMLElement>(screen, ".home-projects-card .card-frame");

    const dark = getComputedStyle(frame, "::before").clipPath;
    setTheme("cyber-sakura");
    finishAnimations();
    const light = getComputedStyle(frame, "::before").clipPath;

    expect(dark).toContain("shape(");
    expect(light).toContain("shape(");
    expect(light).not.toBe(dark);
  });

  it("links the live site in a new tab and disables the links of the projects without a site", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const links = pickAll<HTMLAnchorElement>(screen, ".home-projects-live");

    expect(links.map((item) => item.getAttribute("href"))).toEqual([
      null,
      "https://hectorvip.com/",
      "https://brendmart.com/",
      null,
    ]);
    expect(links.map((item) => item.getAttribute("target"))).toEqual([
      null,
      "_blank",
      "_blank",
      null,
    ]);
    expect(links.map((item) => item.getAttribute("rel"))).toEqual([
      null,
      "noopener noreferrer",
      "noopener noreferrer",
      null,
    ]);
    expect(links.map((item) => item.getAttribute("role"))).toEqual(["link", null, null, "link"]);
    expect(links.map((item) => item.getAttribute("aria-disabled"))).toEqual([
      "true",
      null,
      null,
      "true",
    ]);
    expect(getComputedStyle(links[0]!).pointerEvents).toBe("none");
    expect(getComputedStyle(links[3]!).pointerEvents).toBe("none");
    expect(lists.en.map((item) => item.url)).toEqual([
      null,
      "https://hectorvip.com/",
      "https://brendmart.com/",
      null,
    ]);
  });

  it("links the read case button of each card to the page of its project", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const links = pickAll<HTMLAnchorElement>(screen, ".home-projects-read");

    expect(links.map((item) => item.tagName)).toEqual(["A", "A", "A", "A"]);
    expect(links.map((item) => item.getAttribute("href"))).toEqual([
      "/projects/dobro",
      "/projects/hector",
      "/projects/brendmart",
      "/projects/tamriel-codex",
    ]);
    expect(links.every((item) => item.classList.contains("btn"))).toBe(true);
    expect(links.every((item) => item.querySelector(".btn-frame") !== null)).toBe(true);
  });

  it.each(["en", "ru"] as const)("renders the all projects link in %s", async (locale) => {
    const screen = await renderCase({ width: 1440, height: 900, locale });
    const link = pick<HTMLAnchorElement>(screen, ".home-projects-all");
    const icon = link.querySelector<HTMLElement>(".home-projects-all-icon")!;

    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/projects");
    expect(link.classList.contains("btn")).toBe(true);
    expect(link.querySelector(".btn-frame")).not.toBeNull();
    expect(text(link)).toBe(dictionaries[locale].home.projects.all);
    expect(link.lastElementChild).toBe(icon);
    expect(icon.classList.contains("ui-icon")).toBe(true);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("style")).toContain("M1%206H16M11%201L16%206L11%2011");
    expect(link.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(link.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it("places the all projects link in the head row on desktop and tablet", async () => {
    for (const width of [1440, 768]) {
      const screen = await renderCase({ width, height: 900 });
      const link = pick(screen, ".home-projects-all").getBoundingClientRect();
      const head = pick(screen, ".home-projects-head").getBoundingClientRect();
      const track = pick(screen, ".home-projects-track").getBoundingClientRect();
      const slide = pick(screen, ".home-projects").getBoundingClientRect();
      const edge = width === 1440 ? 140 : 32;

      near(link.width, 250);
      near(link.height, 60);
      near(slide.right - link.right, edge);
      expect(link.bottom).toBeLessThanOrEqual(head.bottom + 1);
      expect(link.top).toBeGreaterThanOrEqual(head.top);
      expect(link.left).toBeGreaterThan(head.left + 1);
      expect(link.bottom).toBeLessThanOrEqual(track.top);
    }
  });

  it("places the all projects link under the cards on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const link = pick(screen, ".home-projects-all").getBoundingClientRect();
    const cards = pickAll(screen, ".home-projects-card");
    const last = cards.at(-1)!.getBoundingClientRect();
    const slide = pick(screen, ".home-projects").getBoundingClientRect();

    expect(link.top).toBeGreaterThanOrEqual(last.bottom);
    near(link.left - slide.left, 20);
    near(slide.right - link.right, 20);
    near(link.height, 60);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it("keeps the all projects link clear of the dots on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
    const link = pick(screen, ".home-projects-all").getBoundingClientRect();
    const dots = pick(screen, ".home-projects-dots").getBoundingClientRect();

    expect(link.bottom).toBeLessThanOrEqual(dots.top);
  });

  it("does not navigate in the stub and keeps the link focusable", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const link = pick<HTMLAnchorElement>(screen, ".home-projects-all");
    const hash = window.location.hash;

    await userEvent.click(page.elementLocator(link));

    expect(window.location.hash).toBe(hash);
    expect(link.tabIndex).toBe(0);
  });

  it("fills the all projects link on hover with a transition", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const link = pick<HTMLAnchorElement>(screen, ".home-projects-all");
    await userEvent.unhover(page.elementLocator(link));
    finishAnimations();
    const rest = getComputedStyle(link, "::before").backgroundColor;

    await userEvent.hover(page.elementLocator(link));
    expect(transitioning(link, "background-color", "::before")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(link, "::before").backgroundColor).not.toBe(rest);
    await userEvent.unhover(page.elementLocator(document.body));
    finishAnimations();
  });

  it("shows a focus ring on the all projects link for keyboard focus only", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const link = pick<HTMLAnchorElement>(screen, ".home-projects-all");

    await userEvent.click(page.elementLocator(document.body));
    link.focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await userEvent.keyboard("{Tab}");

    expect(document.activeElement).toBe(link);
    expect(link.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(link).outlineStyle).not.toBe("none");
    link.blur();
  });

  it("does not animate the all projects link with reduced motion", async () => {
    await setReducedMotion("reduce");
    const screen = await renderCase({ width: 1440, height: 900 });
    const link = pick<HTMLAnchorElement>(screen, ".home-projects-all");
    const frame = link.querySelector<HTMLElement>(".btn-frame")!;

    await userEvent.hover(page.elementLocator(link));
    setTheme("cyber-sakura");
    await nextTick();

    expect(transitioning(link, "background-color", "::before")).toBe(false);
    for (const target of [link, frame]) {
      expect(
        document
          .getAnimations()
          .some((animation) => (animation.effect as KeyframeEffect).target === target),
      ).toBe(false);
    }
    await userEvent.unhover(page.elementLocator(document.body));
  });

  it("scrolls the fourth project into the slide on a dot click on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
    const slide = () => pick(screen, ".home-projects").getBoundingClientRect();
    const fourth = () => pickAll(screen, ".home-projects-card")[3]!.getBoundingClientRect();

    expect(fourth().left - slide().left).toBeGreaterThan(1300);
    await userEvent.click(page.elementLocator(dots[3]!));
    expect(dots[3]!.classList.contains("home-projects-dot-active")).toBe(true);
    await vi.waitFor(() => near(fourth().left - slide().left, 140, 2), { timeout: 5000 });
    expect(fourth().right - slide().left).toBeLessThanOrEqual(1300 + 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  describe("project switch on tablet", () => {
    it("marks the first project and switches on a dot click", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
      const label = (index: number) => dots[index]!.getAttribute("aria-label");

      expect(dots.map((dot) => label(dots.indexOf(dot)))).toEqual([
        "Show project 1",
        "Show project 2",
        "Show project 3",
        "Show project 4",
      ]);
      expect(dots.map((dot) => dot.classList.contains("home-projects-dot-active"))).toEqual([
        true,
        false,
        false,
        false,
      ]);
      expect(dots.map((dot) => dot.getAttribute("aria-current"))).toEqual([
        "true",
        "false",
        "false",
        "false",
      ]);

      await userEvent.click(page.elementLocator(dots[2]!));
      expect(dots.map((dot) => dot.classList.contains("home-projects-dot-active"))).toEqual([
        false,
        false,
        true,
        false,
      ]);
      expect(transitioning(dots[2]!, "width")).toBe(true);
      finishAnimations();
      await vi.waitFor(
        () => {
          const third = pickAll(screen, ".home-projects-card")[2]!.getBoundingClientRect();
          const slide = pick(screen, ".home-projects").getBoundingClientRect();
          near(third.left - slide.left, 32, 2);
        },
        { timeout: 5000 },
      );

      finishAnimations();

      expect(dots[2]!.getBoundingClientRect().width).toBe(26);
      expect(dots[0]!.getBoundingClientRect().width).toBe(10);
      expect(getComputedStyle(dots[0]!).opacity).toBe("0.5");
      expect(getComputedStyle(dots[2]!).opacity).toBe("1");
    });

    it("follows the dragged card and snaps it to the start", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const slide = () => pick(screen, ".home-projects").getBoundingClientRect();
      const card = (index: number) =>
        pickAll(screen, ".home-projects-card")[index]!.getBoundingClientRect();

      await drag(screen, -200);
      await vi.waitFor(() => expect(activeDot(screen)).toBe(1));
      await vi.waitFor(() => near(card(1).left - slide().left, 32, 1), { timeout: 5000 });

      await drag(screen, 200);
      await vi.waitFor(() => expect(activeDot(screen)).toBe(0));
      await vi.waitFor(() => near(card(0).left - slide().left, 32, 1), { timeout: 5000 });
    });

    it("loops from the last project to the first and back", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
      const slide = () => pick(screen, ".home-projects").getBoundingClientRect();
      const card = (index: number) =>
        pickAll(screen, ".home-projects-card")[index]!.getBoundingClientRect();

      await drag(screen, 200);
      await vi.waitFor(() => expect(activeDot(screen)).toBe(dots.length - 1));
      await vi.waitFor(() => near(card(dots.length - 1).left - slide().left, 32, 1), {
        timeout: 5000,
      });
      near(card(0).left - card(dots.length - 1).right, 32, 1);

      await drag(screen, -200);
      await vi.waitFor(() => expect(activeDot(screen)).toBe(0));
      await vi.waitFor(() => near(card(0).left - slide().left, 32, 1), { timeout: 5000 });
    });
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = pick<HTMLElement>(screen, ".home-projects-night");
      const frame = pick<HTMLElement>(screen, ".home-projects-card .card-frame");

      setTheme("cyber-sakura");
      await nextTick();
      expect(transitioning(night, "opacity")).toBe(false);
      expect(transitioning(frame, "filter")).toBe(false);
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

    it("moves the dots and jumps to the card without animation", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
      const slide = pick(screen, ".home-projects").getBoundingClientRect();

      await userEvent.click(page.elementLocator(dots[2]!));
      await nextTick();

      expect(transitioning(dots[2]!, "width")).toBe(false);
      expect(dots[2]!.classList.contains("home-projects-dot-active")).toBe(true);
      near(
        pickAll(screen, ".home-projects-card")[2]!.getBoundingClientRect().left - slide.left,
        32,
        1,
      );
    });
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Projects, { projects: lists.en }) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="projects"');
    expect(html).toContain("home-projects-title");
    expect(html).toContain("Dobro.rf");
    expect(html.match(/class="folder /g)).toHaveLength(4);
    expect(html.match(/home-projects-dot /g)).toHaveLength(4);
  });
});
