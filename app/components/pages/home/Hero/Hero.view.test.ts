import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import Hero from "./Hero.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));
vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));

interface HeroCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: HeroCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: HeroCase[] = [{ name: "desktop", width: 1440, height: 900 }];

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

function running(prefix: string) {
  return document
    .getAnimations()
    .filter(
      (animation) =>
        animation instanceof CSSAnimation && animation.animationName.startsWith(prefix),
    );
}

function properties(animation: Animation) {
  const frames = (animation.effect as KeyframeEffect).getKeyframes();
  const names = frames.flatMap((frame) =>
    Object.keys(frame).filter(
      (key) => !["offset", "computedOffset", "easing", "composite"].includes(key),
    ),
  );
  return [...new Set(names)].sort();
}

function targets(animations: Animation[]) {
  return animations.map((animation) => (animation.effect as KeyframeEffect).target as Element);
}

function playing(prefix: string) {
  const animations = running(prefix);
  return animations.length > 0 && animations.every((item) => item.playState === "running");
}

function stopped(prefix: string) {
  const animations = running(prefix);
  return animations.length > 0 && animations.every((item) => item.playState === "paused");
}

async function waitDecorMotion(prefix: string) {
  await expect.poll(() => playing(prefix), { timeout: 5000 }).toBe(true);
}

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-hero-night, .home-hero-day").length;
}

async function renderCase(item: Pick<HeroCase, "width" | "height" | "locale">, offset = 0) {
  await page.viewport(item.width, item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h(
        "div",
        {
          class: "bg-base-100 font-body text-base-content",
          style: offset ? { marginTop: `${offset}px` } : undefined,
        },
        h(Hero),
      ),
    { global: { plugins: [createApp(locale)] } },
  );
  screen.container.getBoundingClientRect();
  await expect.poll(() => layerCount(screen)).toBe(1);
  return screen;
}

async function prefetchThemeLayers(screen: { container: HTMLElement }) {
  useThemeLayersPrefetch().prefetch();
  await expect.poll(() => layerCount(screen)).toBe(2);
  await expect
    .poll(() => [...screen.container.querySelectorAll("img")].every((image) => image.complete), {
      timeout: 5000,
    })
    .toBe(true);
  screen.container.getBoundingClientRect();
}

async function whileLoading(run: () => Promise<void>) {
  Object.defineProperty(document, "readyState", { configurable: true, get: () => "loading" });
  try {
    await run();
  } finally {
    Reflect.deleteProperty(document, "readyState");
  }
}

function box(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
  const hero = screen.container.querySelector(".home-hero")!.getBoundingClientRect();
  const rect = screen.container.querySelector(selector)!.getBoundingClientRect();
  return {
    left: rect.left - hero.left,
    top: rect.top - hero.top,
    right: hero.right - rect.right,
    bottom: hero.bottom - rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "FULLSTACK DEVELOPER");
  await document.fonts.load('700 1em "Montserrat Alternates"', "FULLSTACK РАЗРАБОТЧИК");
  await document.fonts.load('400 1em "Martian Mono"', "DOWNLOAD MY CV СКАЧАТЬ РЕЗЮМЕ");
});

afterEach(async () => {
  finishAnimations();
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe("decor motion", () => {
  it("keeps the decor paused until the page has loaded and the browser is idle", async () => {
    setTheme("torii-synth");
    await whileLoading(async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(screen.container.querySelector(".home-hero-night")!.classList).toContain(
        "decor-paused",
      );
      expect(stopped("home-hero-firefly")).toBe(true);
      expect(stopped("home-hero-blink")).toBe(true);

      window.dispatchEvent(new Event("load"));
      await waitDecorMotion("home-hero-firefly");
      expect(playing("home-hero-blink")).toBe(true);
      expect(screen.container.querySelector(".home-hero-night")!.classList).not.toContain(
        "decor-paused",
      );
    });
  });
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

  it("renders the heading, the cv button and four social links", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const hero = screen.container.querySelector<HTMLElement>(".home-hero")!;
    const parts = [...hero.querySelectorAll(".home-hero-title > span")].map((item) =>
      item.textContent?.trim(),
    );
    const links = [...hero.querySelectorAll<HTMLAnchorElement>(".home-hero-social")];
    const cta = hero.querySelector<HTMLElement>(".home-hero-cta")!;

    expect(hero.tagName).toBe("SECTION");
    expect(hero.id).toBe("top");
    expect(hero.querySelectorAll("h1")).toHaveLength(1);
    expect(parts).toEqual(["Fullstack", "Developer"]);
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Telegram",
      "LinkedIn",
      "GitHub",
      "YouTube",
    ]);
    expect(links.every((link) => link.getAttribute("href")?.startsWith("https://"))).toBe(true);
    expect(cta.classList.contains("btn")).toBe(true);
    expect(cta.textContent?.trim()).toBe("Download my CV");
    expect(hero.querySelector(".home-hero-night")!.getAttribute("aria-hidden")).toBe("true");
    await prefetchThemeLayers(screen);
    expect(hero.querySelector(".home-hero-day")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("translates the button but keeps the heading in English", async () => {
    const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });
    const hero = screen.container.querySelector<HTMLElement>(".home-hero")!;
    const title = hero.querySelector<HTMLElement>(".home-hero-title")!;
    const parts = [...title.querySelectorAll(":scope > span")].map((item) =>
      item.textContent?.trim(),
    );

    expect(parts).toEqual(["Fullstack", "Developer"]);
    expect(title.lang).toBe("en");
    expect(title.hasAttribute("data-atom-skip")).toBe(true);
    expect(getComputedStyle(title).fontFamily).toContain("Righteous");
    near(Number.parseFloat(getComputedStyle(title).fontSize), 112.32);
    expect(hero.querySelector(".home-hero-cta")!.textContent?.trim()).toBe("Скачать резюме");
  });

  it("lays out like the mockup on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const title = screen.container.querySelector<HTMLElement>(".home-hero-title")!;
    const gate = box(screen, ".home-hero-gate");

    expect(box(screen, ".home-hero").height).toBe(900);
    near(box(screen, ".home-hero-title").left, 317);
    near(Number.parseFloat(getComputedStyle(title).fontSize), 112.32);
    near(box(screen, ".home-hero-title-bottom").left, 317 + 172.8);
    near(box(screen, ".home-hero-cta").left, 172.8);
    near(box(screen, ".home-hero-cta").width, 340);
    near(box(screen, ".home-hero-cta").height, 64);
    near(box(screen, ".home-hero-cta").bottom, 104);
    near(box(screen, ".home-hero-rail").right, 144);
    near(box(screen, ".home-hero-rail").top, 170);
    near(box(screen, ".home-hero-rail").bottom, 110);
    near(gate.left, 1440 * 0.3 - 221);
    near(gate.width, 395);
    expect(getComputedStyle(screen.container.querySelector(".home-hero-branch-low")!).display).toBe(
      "block",
    );
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
    const title = screen.container.querySelector<HTMLElement>(".home-hero-title")!;

    expect(box(screen, ".home-hero").height).toBe(900);
    near(box(screen, ".home-hero-title").left, 56);
    near(Number.parseFloat(getComputedStyle(title).fontSize), 84);
    near(box(screen, ".home-hero-title-bottom").left, 56 + 76);
    near(box(screen, ".home-hero-cta").left, 56);
    near(box(screen, ".home-hero-cta").width, 340);
    near(box(screen, ".home-hero-cta").bottom, 104);
    near(box(screen, ".home-hero-rail").right, 40);
    near(box(screen, ".home-hero-rail").top, 170);
    near(box(screen, ".home-hero-rail").bottom, 110);
    near(box(screen, ".home-hero-gate").width, 395 * 0.9);
  });

  it("lays out like the mockup on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    await prefetchThemeLayers(screen);
    const title = screen.container.querySelector<HTMLElement>(".home-hero-title")!;
    const rail = box(screen, ".home-hero-rail");
    const line = box(screen, ".home-hero-rail-line");

    expect(box(screen, ".home-hero").height).toBe(780);
    near(box(screen, ".home-hero-title").left, 20);
    near(Number.parseFloat(getComputedStyle(title).fontSize), 52);
    near(box(screen, ".home-hero-title-bottom").left, 20 + 36);
    near(box(screen, ".home-hero-cta").left, 20);
    near(box(screen, ".home-hero-cta").width, 350);
    near(box(screen, ".home-hero-cta").bottom, 112);
    near(rail.left, 20);
    near(rail.right, 20);
    near(rail.bottom, 36);
    near(line.height, 2);
    near(box(screen, ".home-hero-gate").width, 395 * 0.6);
    expect(getComputedStyle(screen.container.querySelector(".home-hero-branch-low")!).display).toBe(
      "none",
    );
  });

  it.each([
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
  ])("keeps the heading inside the slide at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    const lines = [...screen.container.querySelectorAll(".home-hero-title > span")];
    const hero = screen.container.querySelector(".home-hero")!.getBoundingClientRect();
    const rail = screen.container.querySelector(".home-hero-rail")!.getBoundingClientRect();

    for (const line of lines) {
      const rect = line.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(hero.left);
      expect(rect.right).toBeLessThanOrEqual(hero.right);
      if (item.width >= 768) expect(rect.right).toBeLessThanOrEqual(rail.left);
    }
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = screen.container.querySelector<HTMLElement>(".home-hero-night")!;
    const day = screen.container.querySelector<HTMLElement>(".home-hero-day")!;
    const title = screen.container.querySelector<HTMLElement>(".home-hero-title-top")!;
    const line = screen.container.querySelector<HTMLElement>(".home-hero-rail-line")!;
    const social = screen.container.querySelector<HTMLElement>(".home-hero-social")!;

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");
    expect(getComputedStyle(social, "::before").opacity).toBe("1");
    expect(getComputedStyle(social, "::after").opacity).toBe("0");

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(title, "filter")).toBe(true);
    expect(transitioning(title, "color")).toBe(true);
    expect(transitioning(title, "-webkit-text-stroke-color")).toBe(true);
    expect(transitioning(title, "--home-hero-stroke")).toBe(true);
    expect(transitioning(line, "box-shadow")).toBe(true);
    expect(transitioning(social, "opacity", "::before")).toBe(true);
    expect(transitioning(social, "opacity", "::after")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
    expect(getComputedStyle(social, "::before").opacity).toBe("0");
    expect(getComputedStyle(social, "::after").opacity).toBe("1");

    await expect.poll(() => layerCount(screen)).toBe(1);
    expect(night.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
  });

  it("animates the fireflies with a move and a blink on the same element", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await waitDecorMotion("home-hero-firefly");
    const fireflies = [...screen.container.querySelectorAll(".home-hero-firefly")];

    expect(fireflies).toHaveLength(18);
    expect(running("home-hero-firefly")).toHaveLength(18);
    expect(running("home-hero-blink")).toHaveLength(18);
    expect(targets(running("home-hero-firefly"))).toEqual(fireflies);
    expect(targets(running("home-hero-blink"))).toEqual(fireflies);
    expect(running("home-hero-firefly").map((item) => properties(item).join())).toEqual(
      fireflies.map(() => "transform"),
    );
    expect(running("home-hero-blink").map((item) => properties(item).join())).toEqual(
      fireflies.map(() => "opacity"),
    );
    expect(running("home-hero-wind")).toHaveLength(0);
  });

  it("moves each petal with two elements and draws the blur and the glow in ::before", async () => {
    setTheme("cyber-sakura");
    const screen = await renderCase({ width: 1440, height: 900 });
    await waitDecorMotion("home-hero-wind");
    const petals = [...screen.container.querySelectorAll<HTMLElement>(".home-hero-petal")];
    const leaves = [...screen.container.querySelectorAll<HTMLElement>(".home-hero-petal-leaf")];
    const blurred = screen.container.querySelector<HTMLElement>(
      ".home-hero-petal-leaf.home-hero-petal-blur",
    )!;

    expect(petals).toHaveLength(30);
    expect(leaves).toHaveLength(30);
    expect(petals.map((petal) => petal.children.length)).toEqual(petals.map(() => 1));
    expect(leaves.map((leaf) => leaf.parentElement)).toEqual(petals);
    expect(screen.container.querySelector(".home-hero-petal-sway")).toBeNull();
    expect(running("home-hero-wind")).toHaveLength(30);
    expect(running("home-hero-sway")).toHaveLength(30);
    expect(running("home-hero-flip")).toHaveLength(30);
    expect(targets(running("home-hero-wind"))).toEqual(petals);
    expect(targets(running("home-hero-sway"))).toEqual(petals);
    expect(targets(running("home-hero-flip"))).toEqual(leaves);
    expect(running("home-hero-wind").map((item) => properties(item).join())).toEqual(
      petals.map(() => "opacity,translate"),
    );
    expect(running("home-hero-sway").map((item) => properties(item).join())).toEqual(
      petals.map(() => "transform"),
    );
    expect(running("home-hero-flip").map((item) => properties(item).join())).toEqual(
      leaves.map(() => "transform"),
    );
    expect(getComputedStyle(leaves[0]!).boxShadow).toBe("none");
    expect(getComputedStyle(leaves[0]!).filter).toBe("none");
    expect(getComputedStyle(leaves[0]!).backgroundImage).toBe("none");
    expect(getComputedStyle(leaves[0]!, "::before").boxShadow).not.toBe("none");
    expect(getComputedStyle(leaves[0]!, "::before").backgroundImage).toContain("linear-gradient");
    expect(getComputedStyle(blurred).filter).toBe("none");
    expect(getComputedStyle(blurred, "::before").filter).toContain("blur(");
  });

  it("animates the social links on hover", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const social = screen.container.querySelector<HTMLElement>(".home-hero-social")!;

    await userEvent.hover(page.elementLocator(social));
    expect(transitioning(social, "transform")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(social).transform).toBe("matrix(1.12, 0, 0, 1.12, 0, 0)");
  });

  it("animates the focus ring of the social links", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const social = screen.container.querySelector<HTMLElement>(".home-hero-social")!;

    expect(getComputedStyle(social).outlineColor).toBe("rgba(0, 0, 0, 0)");
    await userEvent.keyboard("{Tab}");
    social.focus({ focusVisible: true } as FocusOptions);
    expect(transitioning(social, "outline-color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(social).outlineColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("stops the decor and keeps it visible", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      await prefetchThemeLayers(screen);
      const firefly = screen.container.querySelector<HTMLElement>(".home-hero-firefly")!;
      const leaf = screen.container.querySelector<HTMLElement>(".home-hero-petal-leaf")!;

      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(firefly).opacity).toBe("0.7");
      expect(getComputedStyle(leaf).opacity).toBe("0.7");
      expect(getComputedStyle(leaf).transform).not.toBe("none");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = screen.container.querySelector<HTMLElement>(".home-hero-night")!;

      const title = screen.container.querySelector<HTMLElement>(".home-hero-title-top")!;

      setTheme("cyber-sakura");
      await nextTick();
      expect(transitioning(night, "opacity")).toBe(false);
      expect(transitioning(title, "filter")).toBe(false);
      expect(running("home-hero")).toHaveLength(0);
      expect(getComputedStyle(night).opacity).toBe("0");
      expect(getComputedStyle(night).visibility).toBe("hidden");
    });
  });

  it("mounts the inactive layer only on the intent to switch the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderCase({ width: 1440, height: 900 });
    await waitDecorMotion("home-hero-firefly");
    window.dispatchEvent(new Event("load"));
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(screen.container.querySelector(".home-hero-night")).not.toBeNull();
    expect(screen.container.querySelector(".home-hero-day")).toBeNull();
    expect(running("home-hero-wind")).toHaveLength(0);

    await prefetchThemeLayers(screen);
    expect(screen.container.querySelector(".home-hero-day")!.classList).toContain("home-hero-late");
    expect(running("home-hero-wind")).toHaveLength(30);
  });

  it("mounts the layer of a theme switched without the intent and drops the old one", async () => {
    setTheme("torii-synth");
    const screen = await renderCase({ width: 1440, height: 900 });
    setTheme("cyber-sakura");

    await expect.poll(() => screen.container.querySelector(".home-hero-day")).not.toBeNull();
    expect(screen.container.querySelector(".home-hero-night")).not.toBeNull();
    expect(screen.container.querySelector(".home-hero-day")!.classList).toContain("home-hero-late");
    await expect.poll(() => screen.container.querySelector(".home-hero-night")).toBeNull();
    expect(layerCount(screen)).toBe(1);
  });

  it("pauses the decor of the inactive layer", async () => {
    setTheme("torii-synth");
    const screen = await renderCase({ width: 1440, height: 900 });
    await waitDecorMotion("home-hero-firefly");
    await prefetchThemeLayers(screen);

    expect(playing("home-hero-firefly")).toBe(true);
    expect(stopped("home-hero-wind")).toBe(true);
    expect(stopped("home-hero-flip")).toBe(true);
    expect(screen.container.querySelector(".home-hero-day")!.classList).toContain("decor-paused");

    setTheme("cyber-sakura");
    await expect.poll(() => playing("home-hero-wind")).toBe(true);
    expect(playing("home-hero-flip")).toBe(true);
    expect(stopped("home-hero-firefly")).toBe(true);

    await expect.poll(() => screen.container.querySelector(".home-hero-night")).toBeNull();
    expect(running("home-hero-firefly")).toHaveLength(0);
  });

  it("pauses the decor while the slide is off the screen", async () => {
    setTheme("torii-synth");
    window.scrollTo({ top: 0, behavior: "instant" });
    try {
      const screen = await renderCase({ width: 1440, height: 900 }, 2000);

      await expect.poll(() => stopped("home-hero-firefly")).toBe(true);
      expect(screen.container.querySelector(".home-hero-night")!.classList).toContain(
        "decor-paused",
      );

      screen.container.querySelector(".home-hero")!.scrollIntoView({ behavior: "instant" });
      await waitDecorMotion("home-hero-firefly");

      window.scrollTo({ top: 0, behavior: "instant" });
      await expect.poll(() => stopped("home-hero-firefly")).toBe(true);
    } finally {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Hero) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="top"');
    expect(html).toContain("home-hero-title");
    expect(html).toContain("Download my CV");
    expect(html.match(/home-hero-firefly /g)).toHaveLength(18);
    expect(html).toContain("home-hero-night");
    expect(html).not.toContain("home-hero-day");
    expect(html).not.toContain("home-hero-petal-leaf");
  });
});
