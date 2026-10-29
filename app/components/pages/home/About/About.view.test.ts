import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, type Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import About from "./About.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface AboutCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: AboutCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: AboutCase[] = [{ name: "desktop", width: 1440, height: 900 }];

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

const customTransitions = [
  ".home-about-night",
  ".home-about-day",
  ".home-about-crane",
  ".home-about-role",
  ".home-about-photo-edge",
  ".home-about-photo-frame",
  ".home-about-photo-image",
  ".home-about-photo-tint",
  ".home-about-photo-shade",
  ".home-about-photo-corner",
  ".home-about-photo-bar",
  ".home-about-petal",
];

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-about-night, .home-about-day").length;
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

const descriptionTerms: Record<string, string> = {
  fullstack: "Fullstack",
  frontend: "Frontend",
  vue: "Vue.js",
  nuxt: "Nuxt",
  react: "React",
  next: "Next.js",
  backend: "backend",
  laravel: "Laravel",
  nest: "NestJS",
  express: "Express",
  ai: "AI",
  skills: "skills",
};

function description(message: string) {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => descriptionTerms[key]!);
}

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

async function renderCase(item: Pick<AboutCase, "width" | "height" | "locale">) {
  await page.viewport(item.width, item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () => h("div", { class: "bg-base-100 font-body text-base-content" }, h(About)),
    { global: { plugins: [createApp(locale)] } },
  );
  await expect.poll(() => layerCount(screen)).toBe(1);
  screen.container.getBoundingClientRect();
  return screen;
}

function pick<T extends Element>(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function box(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
  const slide = pick(screen, ".home-about").getBoundingClientRect();
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

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Hi, I'm Michael Fullstack Developer.");
  await document.fonts.load('700 1em "Montserrat Alternates"', "Привет, я Михаил");
  await document.fonts.load('300 1em "Martian Mono"', "01 — ABOUT ME OPEN TO PROJECTS");
  await document.fonts.load('400 1em "Martian Mono"', "CONTACT ME PROJECTS");
  await document.fonts.load('400 1em "Share Tech Mono"', description(en.home.about.description));
  await document.fonts.load('400 1em "Share Tech Mono"', description(ru.home.about.description));
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

  it("renders the heading, the description, two actions and the photo", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const slide = pick<HTMLElement>(screen, ".home-about");
    const actions = [...slide.querySelectorAll<HTMLElement>(".home-about-action")];
    const photo = pick<HTMLImageElement>(screen, ".home-about-photo-image");

    expect(slide.tagName).toBe("SECTION");
    expect(slide.id).toBe("about");
    expect(slide.querySelectorAll("h2")).toHaveLength(1);
    expect(slide.querySelector("h1")).toBeNull();
    expect(pick(screen, ".home-about-label").textContent).toBe(en.home.about.label);
    expect(pick(screen, ".home-about-title").textContent?.replace(/\s+/g, " ").trim()).toBe(
      `${en.home.about.greeting} ${en.home.about.name}`,
    );
    expect(pick(screen, ".home-about-name").textContent).toBe(en.home.about.name);
    expect(pick(screen, ".home-about-role").textContent?.trim()).toBe("Fullstack Developer.");
    expect(pick(screen, ".home-about-role").getAttribute("lang")).toBe("en");
    expect(pick(screen, ".home-about-role").hasAttribute("data-atom-skip")).toBe(true);
    expect(getComputedStyle(pick(screen, ".home-about-role")).fontFamily).toContain("Righteous");
    expect(pick(screen, ".home-about-description").textContent).toBe(
      description(en.home.about.description),
    );
    expect(actions.map((item) => item.textContent?.trim())).toEqual([
      en.home.about.contact,
      en.home.about.projects,
    ]);
    expect(actions.every((item) => item.classList.contains("btn"))).toBe(true);
    expect(actions[1]!.classList.contains("btn-primary")).toBe(true);
    expect(pick(screen, ".home-about-status").textContent?.trim()).toBe(en.home.about.status);
    expect(photo.getAttribute("alt")).toBe(en.home.about.photoAlt);
    expect(photo.complete).toBe(true);
    expect(photo.naturalWidth).toBeGreaterThan(0);
    expect(pick(screen, ".home-about-decor").getAttribute("aria-hidden")).toBe("true");
  });

  it("translates the texts", async () => {
    const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });

    expect(pick(screen, ".home-about-label").textContent).toBe(ru.home.about.label);
    expect(pick(screen, ".home-about-name").textContent).toBe(ru.home.about.name);
    expect(pick(screen, ".home-about-role").textContent?.trim()).toBe("Fullstack Developer.");
    expect(pick(screen, ".home-about-role").getAttribute("lang")).toBe("en");
    expect(pick(screen, ".home-about-role").hasAttribute("data-atom-skip")).toBe(true);
    expect(getComputedStyle(pick(screen, ".home-about-role")).fontFamily).toContain("Righteous");
    expect(pick(screen, ".home-about-description").textContent).toBe(
      description(ru.home.about.description),
    );
    expect(pick(screen, ".home-about-status").textContent?.trim()).toBe(ru.home.about.status);
    expect(pick(screen, ".home-about-photo-image").getAttribute("alt")).toBe(
      ru.home.about.photoAlt,
    );
    expect(
      [...screen.container.querySelectorAll(".home-about-action")].map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual([ru.home.about.contact, ru.home.about.projects]);
  });

  it.each(["en", "ru"] as const)(
    "marks every technical term of the description as English in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const paragraph = pick(screen, ".home-about-description");
      const terms = [...paragraph.querySelectorAll("[data-atom-skip]")];
      const messages = { en, ru }[locale];
      const keys = [...messages.home.about.description.matchAll(/\{(\w+)\}/g)].map(
        (match) => match[1]!,
      );

      expect(paragraph.tagName).toBe("P");
      expect(keys).toHaveLength(Object.keys(descriptionTerms).length);
      expect(terms.map((item) => item.textContent)).toEqual(
        keys.map((key) => descriptionTerms[key]),
      );
      for (const term of terms) {
        expect(term.getAttribute("lang"), term.textContent!).toBe("en");
        expect(term.tagName).toBe("SPAN");
      }
      expect(paragraph.querySelectorAll("[lang]")).toHaveLength(terms.length);
    },
  );

  it("lays out like the mockup on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const title = pick<HTMLElement>(screen, ".home-about-title");
    const role = pick<HTMLElement>(screen, ".home-about-role");
    const text = pick<HTMLElement>(screen, ".home-about-description");

    expect(box(screen, ".home-about").height).toBe(900);
    near(box(screen, ".home-about-text").left, 140);
    near(box(screen, ".home-about-text").width, 640);
    near(box(screen, ".home-about-photo").width, 440);
    near(box(screen, ".home-about-photo").height, 540);
    near(box(screen, ".home-about-photo").right, 140);
    near(box(screen, ".home-about-photo").top, (900 - 540) / 2);
    near(Number.parseFloat(getComputedStyle(title).fontSize), 76);
    near(Number.parseFloat(getComputedStyle(role).fontSize), 42);
    near(Number.parseFloat(getComputedStyle(text).fontSize), 18);
    near(box(screen, ".home-about-action").width, 250);
    near(box(screen, ".home-about-action").height, 60);
    near(
      pick(screen, ".home-about-actions").children[1]!.getBoundingClientRect().left -
        pick(screen, ".home-about-actions").children[0]!.getBoundingClientRect().right,
      20,
    );
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
    const photo = pick(screen, ".home-about-photo").getBoundingClientRect();
    const text = pick(screen, ".home-about-text").getBoundingClientRect();

    near(box(screen, ".home-about-text").left, 64);
    near(Number.parseFloat(getComputedStyle(pick(screen, ".home-about-title")).fontSize), 60);
    near(Number.parseFloat(getComputedStyle(pick(screen, ".home-about-role")).fontSize), 34);
    near(box(screen, ".home-about-photo").width, 440 * 0.9);
    near(photo.left + photo.width / 2, 384);
    expect(photo.top).toBeGreaterThan(text.bottom);
    near(photo.top - text.bottom, 56);
    near(box(screen, ".home-about-action").width, 250);
  });

  it("lays out like the mockup on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const photo = pick(screen, ".home-about-photo").getBoundingClientRect();
    const text = pick(screen, ".home-about-text").getBoundingClientRect();
    const first = pick(screen, ".home-about-action").getBoundingClientRect();

    near(box(screen, ".home-about-text").left, 20);
    near(box(screen, ".home-about-text").top, 120);
    near(Number.parseFloat(getComputedStyle(pick(screen, ".home-about-title")).fontSize), 42);
    near(Number.parseFloat(getComputedStyle(pick(screen, ".home-about-role")).fontSize), 26);
    near(first.width, 350);
    near(first.height, 60);
    near(photo.width, 440 * 0.72);
    near(photo.left + photo.width / 2, 195);
    near(photo.top - text.bottom, 44);
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
    const slide = pick(screen, ".home-about").getBoundingClientRect();
    const parts = [
      ".home-about-label",
      ".home-about-title",
      ".home-about-role",
      ".home-about-description",
      ".home-about-action",
      ".home-about-photo",
    ];

    for (const selector of parts) {
      for (const element of screen.container.querySelectorAll(selector)) {
        const rect = element.getBoundingClientRect();
        expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left);
        expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
      }
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
  });

  it.each(["en", "ru"] as const)(
    "fits the screen below the header at 1440 x 900 in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick(screen, ".home-about").getBoundingClientRect();
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const grid = pick(screen, ".home-about-grid").getBoundingClientRect();
      const header = 110;

      expect(slide.height).toBe(900);
      expect(grid.top - slide.top).toBeGreaterThanOrEqual(header - 1);
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
        header - 1,
      );
      expect(grid.height).toBeLessThanOrEqual(900 - header);
    },
  );

  it.each([
    { width: 1440, height: 900, header: 110 },
    { width: 768, height: 900, header: 94 },
    { width: 390, height: 780, header: 92 },
  ])("starts the content below the header at $width", async (item) => {
    const screen = await renderCase(item);
    const text = pick(screen, ".home-about-text").getBoundingClientRect();
    const slide = pick(screen, ".home-about").getBoundingClientRect();

    expect(text.top - slide.top).toBeGreaterThanOrEqual(item.header - 1);
  });

  it("mounts only the layer of the current theme until the theme switch is intended", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(screen.container.querySelectorAll(".home-about-night")).toHaveLength(1);
    expect(screen.container.querySelector(".home-about-day")).toBeNull();
    expect(screen.container.querySelector(".home-about-crane-day")).toBeNull();
    expect(screen.container.querySelectorAll(".home-about-crane")).toHaveLength(1);
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = pick<HTMLElement>(screen, ".home-about-night");
    const day = pick<HTMLElement>(screen, ".home-about-day");
    const craneNight = pick<HTMLElement>(screen, ".home-about-crane-night");
    const craneDay = pick<HTMLElement>(screen, ".home-about-crane-day");
    const role = pick<HTMLElement>(screen, ".home-about-role");
    const edge = pick<HTMLElement>(screen, ".home-about-photo-edge");
    const frame = pick<HTMLElement>(screen, ".home-about-photo-frame");
    const image = pick<HTMLElement>(screen, ".home-about-photo-image");
    const tint = pick<HTMLElement>(screen, ".home-about-photo-tint");
    const shade = pick<HTMLElement>(screen, ".home-about-photo-shade");
    const corner = pick<HTMLElement>(screen, ".home-about-photo-corner");
    const petal = pick<HTMLElement>(screen, ".home-about-petal");

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");
    expect(getComputedStyle(craneNight).opacity).toBe("1");
    expect(getComputedStyle(craneDay).opacity).toBe("0");
    expect(getComputedStyle(corner).opacity).toBe("1");
    expect(getComputedStyle(petal).opacity).toBe("0");

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(craneNight, "opacity")).toBe(true);
    expect(transitioning(craneDay, "opacity")).toBe(true);
    expect(transitioning(role, "--home-about-role-via")).toBe(true);
    expect(transitioning(edge, "clip-path")).toBe(true);
    expect(transitioning(edge, "--home-about-edge-to")).toBe(true);
    expect(transitioning(frame, "clip-path")).toBe(true);
    expect(transitioning(image, "filter")).toBe(true);
    expect(transitioning(tint, "--home-about-tint-to")).toBe(true);
    expect(transitioning(shade, "--home-about-shade-start")).toBe(true);
    expect(transitioning(corner, "opacity")).toBe(true);
    expect(transitioning(petal, "opacity")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
    expect(getComputedStyle(craneDay).opacity).toBe("1");
    expect(getComputedStyle(corner).opacity).toBe("0");
    expect(getComputedStyle(petal).opacity).toBe("0.9");

    await expect.poll(() => layerCount(screen)).toBe(1);
    expect(night.isConnected).toBe(false);
    expect(craneNight.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
    expect(craneDay.isConnected).toBe(true);
  });

  it("changes the shape of the photo frame with the theme", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const edge = pick<HTMLElement>(screen, ".home-about-photo-edge");

    const dark = getComputedStyle(edge).clipPath;
    setTheme("cyber-sakura");
    finishAnimations();
    const light = getComputedStyle(edge).clipPath;

    expect(dark).toContain("shape(");
    expect(light).toContain("shape(");
    expect(light).not.toBe(dark);
  });

  it("scrolls to the contact section and links to the projects page from the actions", async () => {
    const scrolled = vi.fn();
    const contact = document.createElement("section");
    const projects = document.createElement("section");
    contact.id = "contact";
    projects.id = "projects";
    contact.scrollIntoView = () => scrolled("contact");
    projects.scrollIntoView = () => scrolled("projects");
    document.body.append(contact, projects);
    const screen = await renderCase({ width: 1440, height: 900 });
    const actions = [...screen.container.querySelectorAll<HTMLElement>(".home-about-action")];

    await userEvent.click(page.elementLocator(actions[0]!));
    await userEvent.click(page.elementLocator(actions[1]!));
    contact.remove();
    projects.remove();

    expect(scrolled.mock.calls).toEqual([["contact"]]);
    expect(actions[0]!.tagName).toBe("BUTTON");
    expect(actions[1]!.tagName).toBe("A");
    expect(actions[1]!.getAttribute("href")).toBe(Route.projects);
    expect(actions[1]!.hasAttribute("type")).toBe(false);
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = pick<HTMLElement>(screen, ".home-about-night");
      const edge = pick<HTMLElement>(screen, ".home-about-photo-edge");

      setTheme("cyber-sakura");
      await nextTick();
      expect(transitioning(night, "opacity")).toBe(false);
      expect(transitioning(edge, "clip-path")).toBe(false);
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
    const app = createSSRApp({ render: () => h(About) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="about"');
    expect(html).toContain("home-about-title");
    expect(html).toContain("Fullstack Developer.");
    expect(html.match(/home-about-petal"/g)).toHaveLength(5);
  });
});
