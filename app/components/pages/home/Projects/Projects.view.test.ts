import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildProjects } from "#shared/mock/build";
import { staticSources } from "#shared/mock/sources.static";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import Projects from "./Projects.vue";
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

const cases: ProjectsCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900, tall: 1400 },
  { name: "mobile", width: 390, height: 780, tall: 2400 },
  { name: "desktop-ru", width: 1440, height: 900, locale: "ru" },
  { name: "tablet-ru", width: 768, height: 900, locale: "ru", tall: 1400 },
  { name: "mobile-ru", width: 390, height: 780, locale: "ru", tall: 2400 },
];

const switchCases: ProjectsCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900, tall: 1400 },
];

const customTransitions = [
  ".home-projects-night",
  ".home-projects-day",
  ".home-projects-accent",
  ".home-projects-dot",
  ".home-projects-live",
  ".home-projects-read",
  ".home-projects-all",
];

function mismatch(item: Pick<ProjectsCase, "tall">) {
  return item.tall === undefined ? {} : { allowedMismatchedPixelRatio: 0.01 };
}

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

const lists = {
  en: buildProjects(staticSources("en"), "en"),
  ru: buildProjects(staticSources("ru"), "ru"),
};

const CARD_TAGS = 3;

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

async function renderCase(item: Pick<ProjectsCase, "width" | "height" | "locale" | "tall">) {
  await page.viewport(item.width, item.tall ?? item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h(
        "div",
        { class: "bg-base-100 font-body text-base-content" },
        h(Projects, { projects: lists[locale] }),
      ),
    { global: { plugins: [createApp(locale)] } },
  );
  await expect
    .poll(
      () => screen.container.querySelectorAll(".home-projects-night, .home-projects-day").length,
    )
    .toBe(2);
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
  await document.fonts.load('400 1em "Righteous"', "My Projects Qwixit Brendmart Pine Ridge");
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
      .toMatchScreenshot(`${theme}-${item.name}`, { comparatorOptions: mismatch(item) });
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderCase(item);
    screen.container.getBoundingClientRect();
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
    "renders the heading and three project cards in %s",
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
      expect(cards).toHaveLength(3);
      expect(cards.map((item) => text(item.querySelector(".card-title")))).toEqual([
        "01 Qwixit",
        "02 Brendmart",
        "03 Pine Ridge",
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
        Array(3).fill(dictionary.readCase),
      );
      expect(pickAll(screen, ".home-projects-live").map((item) => text(item))).toEqual(
        Array(3).fill(dictionary.liveSite),
      );
      expect(cards.every((item) => item.classList.contains("folder"))).toBe(true);
      expect(pick(screen, ".home-projects-decor").getAttribute("aria-hidden")).toBe("true");
    },
  );

  it("shows the three project previews", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const images = pickAll<HTMLImageElement>(screen, ".card-media-image");

    expect(images).toHaveLength(3);
    for (const image of images) {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
    }
    expect(new Set(images.map((image) => image.src)).size).toBe(3);
  });

  it.each(["en", "ru"] as const)(
    "shows the first three of the four tags of Qwixit in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const qwixit = lists[locale][0]!;
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

    expect(box(screen, ".home-projects").height).toBe(900);
    near(box(screen, ".home-projects-head").left, 140);
    near(size(screen, ".home-projects-label"), 14);
    near(size(screen, ".home-projects-title"), 64);
    near(size(screen, ".home-projects-description"), 16);
    near(size(screen, ".home-projects-card .card-title"), 28);
    near(size(screen, ".home-projects-card .card-subtitle"), 12);
    near(size(screen, ".home-projects-card .card-text"), 14);
    near(cards[0]!.left - pick(screen, ".home-projects").getBoundingClientRect().left, 140);
    for (const card of cards) near(card.width, (1160 - 64) / 3);
    near(cards[1]!.left - cards[0]!.right, 32);
    near(cards[2]!.left - cards[1]!.right, 32);
    expect(cards[0]!.height).toBeGreaterThanOrEqual(cards.at(1)!.height - 1);
    near(cards[0]!.height, cards[2]!.height);
    expect(getComputedStyle(dots).display).toBe("none");
    near(box(screen, ".home-projects-read").width, 127, 1);
    expect(getComputedStyle(pick(screen, ".home-projects-track")).flexDirection).toBe("row");
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
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
    expect(track.scrollWidth).toBeGreaterThan(track.clientWidth);
    expect(getComputedStyle(track).overflowX).toBe("auto");
    expect(getComputedStyle(track).scrollSnapType).toContain("x");
    expect(getComputedStyle(pick(screen, ".home-projects-dots")).display).toBe("flex");
    expect(dots.map((dot) => dot.getBoundingClientRect().width)).toEqual([26, 10, 10]);
    near(dots[0]!.getBoundingClientRect().height, 4);
    near(dots[1]!.getBoundingClientRect().left - dots[0]!.getBoundingClientRect().right, 10);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
  });

  it("lays out like the mockup on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const cards = pickAll(screen, ".home-projects-card").map((item) =>
      item.getBoundingClientRect(),
    );

    near(box(screen, ".home-projects-head").left, 20);
    near(size(screen, ".home-projects-title"), 44);
    expect(getComputedStyle(pick(screen, ".home-projects-track")).flexDirection).toBe("column");
    expect(getComputedStyle(pick(screen, ".home-projects-dots")).display).toBe("none");
    for (const card of cards) near(card.width, 350);
    near(cards[1]!.top - cards[0]!.bottom, 32);
    near(cards[2]!.top - cards[1]!.bottom, 32);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
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
    const track = pick(screen, ".home-projects-track");
    const scrolls = getComputedStyle(track).overflowX === "auto";
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
        if (scrolls && selector === ".home-projects-card") continue;
        const rect = element.getBoundingClientRect();
        expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left);
        expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
      }
    }
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
    "fits the screen below the header at 1440 x 900 in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick(screen, ".home-projects").getBoundingClientRect();
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const main = pick(screen, ".home-projects-main").getBoundingClientRect();
      const header = 110;

      expect(slide.height).toBe(900);
      expect(main.top - slide.top).toBeGreaterThanOrEqual(header - 1);
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
        header - 1,
      );
      expect(
        pick(screen, ".home-projects-track").getBoundingClientRect().bottom - slide.top,
      ).toBeLessThanOrEqual(900 - 24);
    },
  );

  it.each([
    { width: 1440, height: 900, header: 110 },
    { width: 768, height: 900, header: 94 },
    { width: 390, height: 780, header: 92 },
  ])("starts the content below the header at $width", async (item) => {
    const screen = await renderCase(item);
    const head = pick(screen, ".home-projects-head").getBoundingClientRect();
    const slide = pick(screen, ".home-projects").getBoundingClientRect();

    expect(head.top - slide.top).toBeGreaterThanOrEqual(item.header - 1);
  });

  it("colours every card with its own accent", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".home-projects-card");
    const tokens = ["--color-primary", "--color-secondary", "--color-accent"];
    const inks = ["--color-primary-ink", "--color-secondary-ink", "--color-accent-ink"];

    cards.forEach((card, index) => {
      expect(getComputedStyle(card.querySelector(".card-index")!).color).toBe(
        resolve(inks[index]!),
      );
      expect(getComputedStyle(card.querySelector(".card-subtitle")!).color).toBe(
        resolve(inks[index]!),
      );
      const accent = getComputedStyle(card).getPropertyValue("--home-projects-accent").trim();
      expect(accent).toBe(
        getComputedStyle(document.documentElement).getPropertyValue(tokens[index]!).trim(),
      );
      expect(getComputedStyle(card).getPropertyValue("--card-mark-color").trim()).toBe(accent);
      expect(getComputedStyle(card).getPropertyValue("--card-side-color").trim()).toBe(accent);
    });
    const buttons = pickAll(screen, ".home-projects-read");
    expect(buttons.map((item) => item.classList.contains("btn-primary"))).toEqual([
      true,
      false,
      false,
    ]);
    expect(buttons.map((item) => item.classList.contains("btn-secondary"))).toEqual([
      false,
      true,
      false,
    ]);
    expect(buttons.map((item) => item.classList.contains("btn-accent"))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
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
    expect(transitioning(frame, "filter")).toBe(true);
    expect(transitioning(frame, "clip-path", "::before")).toBe(true);
    expect(transitioning(live, "color")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
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

  it("links the live site in a new tab and disables the link of the project without a site", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const links = pickAll<HTMLAnchorElement>(screen, ".home-projects-live");

    expect(links.map((item) => item.getAttribute("href"))).toEqual([
      "https://qwixit.com/",
      "https://brendmart.com/",
      null,
    ]);
    expect(links.map((item) => item.getAttribute("target"))).toEqual(Array(3).fill("_blank"));
    expect(links.map((item) => item.getAttribute("rel"))).toEqual(
      Array(3).fill("noopener noreferrer"),
    );
    expect(links.map((item) => item.getAttribute("aria-disabled"))).toEqual([null, null, "true"]);
    expect(getComputedStyle(links[2]!).pointerEvents).toBe("none");
    expect(lists.en.map((item) => item.url)).toEqual([
      "https://qwixit.com/",
      "https://brendmart.com/",
      null,
    ]);
  });

  it("links the read case button of each card to the page of its project", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const links = pickAll<HTMLAnchorElement>(screen, ".home-projects-read");

    expect(links.map((item) => item.tagName)).toEqual(["A", "A", "A"]);
    expect(links.map((item) => item.getAttribute("href"))).toEqual([
      "/projects/qwixit",
      "/projects/brendmart",
      "/projects/pine-ridge",
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

  describe("project switch on tablet", () => {
    it("marks the first project and switches on a dot click", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const track = pick<HTMLElement>(screen, ".home-projects-track");
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
      const label = (index: number) => dots[index]!.getAttribute("aria-label");

      expect(dots.map((dot) => label(dots.indexOf(dot)))).toEqual([
        "Show project 1",
        "Show project 2",
        "Show project 3",
      ]);
      expect(dots.map((dot) => dot.classList.contains("home-projects-dot-active"))).toEqual([
        true,
        false,
        false,
      ]);
      expect(dots.map((dot) => dot.getAttribute("aria-current"))).toEqual([
        "true",
        "false",
        "false",
      ]);

      await userEvent.click(page.elementLocator(dots[2]!));
      expect(dots.map((dot) => dot.classList.contains("home-projects-dot-active"))).toEqual([
        false,
        false,
        true,
      ]);
      expect(transitioning(dots[2]!, "width")).toBe(true);
      finishAnimations();
      track.style.scrollBehavior = "auto";
      track.scrollTo({ left: 0 });
      await nextTick();
      await userEvent.click(page.elementLocator(dots[2]!));
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

    it("follows the scroll position", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const track = pick<HTMLElement>(screen, ".home-projects-track");
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");
      track.style.scrollBehavior = "auto";
      track.style.scrollSnapType = "none";

      track.scrollTo({ left: 362 });
      await vi.waitFor(() =>
        expect(dots[1]!.classList.contains("home-projects-dot-active")).toBe(true),
      );
      track.scrollTo({ left: 0 });
      await vi.waitFor(() =>
        expect(dots[0]!.classList.contains("home-projects-dot-active")).toBe(true),
      );
      expect(dots[1]!.classList.contains("home-projects-dot-active")).toBe(false);
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

    it("moves the dots without animation", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const dots = pickAll<HTMLElement>(screen, ".home-projects-dot");

      await userEvent.click(page.elementLocator(dots[1]!));

      expect(transitioning(dots[1]!, "width")).toBe(false);
      expect(dots[1]!.classList.contains("home-projects-dot-active")).toBe(true);
      expect(getComputedStyle(pick(screen, ".home-projects-track")).scrollBehavior).toBe("auto");
    });
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Projects, { projects: lists.en }) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="projects"');
    expect(html).toContain("home-projects-title");
    expect(html).toContain("Qwixit");
    expect(html.match(/class="folder /g)).toHaveLength(3);
    expect(html.match(/home-projects-dot /g)).toHaveLength(3);
  });
});
