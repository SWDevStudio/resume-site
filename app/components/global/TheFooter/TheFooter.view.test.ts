import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheFooter from "./TheFooter.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface TheFooterCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: TheFooterCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 780 },
  { name: "desktop-ru", width: 1440, height: 900, locale: "ru" },
  { name: "tablet-ru", width: 768, height: 900, locale: "ru" },
  { name: "mobile-ru", width: 390, height: 780, locale: "ru" },
];

const switchCases: TheFooterCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 780 },
];

const customTransitions = [
  ".the-footer-day",
  ".the-footer-line",
  ".the-footer-logo",
  ".the-footer-top",
  ".the-footer-top-icon",
  ".home-contact-social",
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

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

function pin(container: Element) {
  const wrapper = container.firstElementChild as HTMLElement;
  wrapper.style.height = "";
  wrapper.style.height = `${Math.ceil(wrapper.getBoundingClientRect().height)}px`;
}

async function renderCase(item: Pick<TheFooterCase, "width" | "height" | "locale">, still = false) {
  await page.viewport(item.width, item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h(
        "div",
        { class: ["bg-base-100 font-body text-base-content", { "pointer-events-none": still }] },
        h(TheFooter),
      ),
    { global: { plugins: [createApp(locale)] } },
  );
  await document.fonts.ready;
  pin(screen.container);
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
  const slide = pick(screen, ".the-footer").getBoundingClientRect();
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

function lines(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
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
  await document.fonts.load('400 1em "Martian Mono"', "SOWA_DEV Fullstack developer");
  await document.fonts.load('300 1em "Martian Mono"', "© 2026 Michael BACK TO TOP Наверх");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  vi.useRealTimers();
  await setReducedMotion("no-preference");
  window.scrollTo({ top: 0, behavior: "instant" });
  await page.viewport(1440, 900);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 5, 1));
    const screen = await renderCase(item, true);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 5, 1));
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderCase(item, true);
    screen.container.getBoundingClientRect();
    document.documentElement.dataset.theme = "cyber-sakura";

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
    document.documentElement.dataset.theme = "torii-synth";
  });

  it.each(["en", "ru"] as const)("renders the brand and the copyright in %s", async (locale) => {
    const screen = await renderCase({ width: 1440, height: 900, locale });
    const slide = pick<HTMLElement>(screen, ".the-footer");
    const dictionary = dictionaries[locale].footer;

    expect(slide.tagName).toBe("FOOTER");
    expect(slide.id).toBe("footer");
    expect(slide.classList.contains("home-slide")).toBe(false);
    expect(text(pick(screen, ".the-footer-logo"))).toBe("SOWA_DEV");
    expect(text(pick(screen, ".the-footer-tagline"))).toBe(
      `Fullstack developer · ${dictionary.tagline}`,
    );
    expect(pick(screen, ".the-footer-tagline > [lang='en']").hasAttribute("data-atom-skip")).toBe(
      true,
    );
    expect(screen.container.querySelector(".the-footer-nav")).toBeNull();
    expect(screen.container.querySelector("nav")).toBeNull();
    expect(pick(screen, ".the-footer-logo").getAttribute("href")).toBe("#top");
    expect(text(pick(screen, ".the-footer-top"))).toBe(dictionary.top);
    expect(pick(screen, ".the-footer-top").tagName).toBe("BUTTON");
    expect(pick(screen, ".the-footer-top").getAttribute("type")).toBe("button");
    expect(pick(screen, ".the-footer-top").hasAttribute("href")).toBe(false);
    expect(pick(screen, ".the-footer-decor").getAttribute("aria-hidden")).toBe("true");
    expect(pickAll(screen, ".the-footer-petal")).toHaveLength(6);
  });

  describe("back to top", () => {
    const spacers: HTMLElement[] = [];

    afterEach(() => {
      for (const spacer of spacers.splice(0)) spacer.remove();
    });

    async function scrollDown() {
      const spacer = document.createElement("div");
      spacer.style.height = "3000px";
      document.body.prepend(spacer);
      spacers.push(spacer);
      window.scrollTo({ top: 1200, behavior: "instant" });
      await expect.poll(() => window.scrollY).toBe(1200);
    }

    it("scrolls the page to the top smoothly without any anchor on the page", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      await scrollDown();

      expect(document.getElementById("top")).toBeNull();
      pick<HTMLButtonElement>(screen, ".the-footer-top").click();

      await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(0);
    });

    it("keeps the address and the hash unchanged on click", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      await scrollDown();
      const href = window.location.href;
      const hash = window.location.hash;

      pick<HTMLButtonElement>(screen, ".the-footer-top").click();

      await expect.poll(() => window.scrollY, { timeout: 5000 }).toBe(0);
      expect(window.location.hash).toBe(hash);
      expect(window.location.hash).not.toBe("#top");
      expect(window.location.href).toBe(href);
    });

    it("scrolls instantly under reduced motion", async () => {
      await setReducedMotion("reduce");
      const screen = await renderCase({ width: 1440, height: 900 });
      await scrollDown();

      pick<HTMLButtonElement>(screen, ".the-footer-top").click();

      expect(window.scrollY).toBe(0);
    });
  });

  it("shows the current year in the copyright", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const year = new Date().getFullYear();

    expect(text(pick(screen, ".the-footer-copyright"))).toBe(
      en.footer.copyright.replace("{year}", String(year)),
    );
    expect(text(pick(screen, ".the-footer-copyright"))).toContain(`© ${year} Michael`);
  });

  it.each([
    {
      year: 2031,
      locale: "en" as const,
      expected: "© 2031 Michael · SOWA_DEV. All rights reserved.",
    },
    {
      year: 2027,
      locale: "ru" as const,
      expected: "© 2027 Михаил · SOWA_DEV. Все права защищены.",
    },
  ])("takes the year $year from the clock in $locale", async ({ year, locale, expected }) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(year, 5, 1));
    const screen = await renderCase({ width: 1440, height: 900, locale });

    expect(text(pick(screen, ".the-footer-copyright"))).toBe(expected);
  });

  it("links the social networks", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const socials = pickAll<HTMLAnchorElement>(screen, ".home-contact-social");

    expect(socials.map((item) => item.getAttribute("aria-label"))).toEqual([
      "Telegram",
      "LinkedIn",
      "GitHub",
      "YouTube",
    ]);
    for (const item of socials) {
      expect(item.getAttribute("href")).toMatch(/^https:\/\//);
      expect(item.getAttribute("target")).toBe("_blank");
      expect(item.getAttribute("rel")).toBe("noopener noreferrer");
    }
    near(socials[0]!.getBoundingClientRect().width, 44);
    near(socials[0]!.getBoundingClientRect().height, 44);
  });

  describe("layout", () => {
    it("lays out like the mockup on desktop", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const row = pick(screen, ".the-footer-row").getBoundingClientRect();

      expect(box(screen, ".the-footer").width).toBe(1440);
      near(box(screen, ".the-footer-logo").left, 140);
      near(size(screen, ".the-footer-logo"), 24);
      near(size(screen, ".the-footer-tagline"), 14);
      near(size(screen, ".the-footer-copyright"), 12);
      near(size(screen, ".the-footer-top"), 12);
      near(box(screen, ".the-footer-top").right, 140);
      near(box(screen, ".the-footer-rule").height, 1);
      near(box(screen, ".the-footer-rule").width, 1160);
      near(box(screen, ".the-footer-line").height, 2);
      near(box(screen, ".the-footer-line").width, 1440);
      for (const selector of [".the-footer-brand", ".the-footer-socials"]) {
        const rect = pick(screen, selector).getBoundingClientRect();
        expect(rect.top, selector).toBeGreaterThanOrEqual(row.top - 1);
        expect(rect.bottom, selector).toBeLessThanOrEqual(row.bottom + 1);
      }
    });

    it("keeps the tagline on one line and puts the socials beside the brand on desktop", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const brand = pick(screen, ".the-footer-brand").getBoundingClientRect();
      const socials = pick(screen, ".the-footer-socials").getBoundingClientRect();
      const row = pick(screen, ".the-footer-row").getBoundingClientRect();

      expect(lines(pick(screen, ".the-footer-tagline"))).toBe(1);
      expect(socials.left).toBeGreaterThanOrEqual(brand.right);
      near(box(screen, ".the-footer-socials").right, 140);
      near(socials.top + socials.height / 2, brand.top + brand.height / 2);
      near(row.height, 56, 2);
      near(box(screen, ".the-footer").height, 281, 2);
    });

    it("has no footer navigation", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      expect(screen.container.querySelector("nav")).toBeNull();
      expect(screen.container.querySelector(".the-footer-nav")).toBeNull();
      expect(screen.container.querySelector(".the-footer-link")).toBeNull();
    });

    it.each([1024, 1280, 1920])("keeps the tagline on one line at %ipx", async (width) => {
      const screen = await renderCase({ width, height: 900 });
      const brand = pick(screen, ".the-footer-brand").getBoundingClientRect();
      const socials = pick(screen, ".the-footer-socials").getBoundingClientRect();
      const row = pick(screen, ".the-footer-row").getBoundingClientRect();

      expect(lines(pick(screen, ".the-footer-tagline"))).toBe(1);
      expect(brand.height).toBeLessThan(60);
      expect(socials.left).toBeGreaterThanOrEqual(brand.right);
      expect(socials.right).toBeLessThanOrEqual(row.right + 1);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    });

    it("puts the socials under the brand on tablet", async () => {
      const screen = await renderCase({ width: 768, height: 900 });
      const brand = pick(screen, ".the-footer-brand").getBoundingClientRect();
      const socials = pick(screen, ".the-footer-socials").getBoundingClientRect();

      expect(lines(pick(screen, ".the-footer-tagline"))).toBe(1);
      expect(socials.top).toBeGreaterThanOrEqual(brand.bottom);
      near(box(screen, ".the-footer-brand").left, 32);
      near(box(screen, ".the-footer-socials").left, 32);
      near(box(screen, ".the-footer-logo").top, 56);
      near(box(screen, ".the-footer-top").bottom, 32);
      near(box(screen, ".the-footer").height, 341, 2);
    });

    it("stacks the brand and the socials on mobile", async () => {
      const screen = await renderCase({ width: 390, height: 780 });
      const brand = pick(screen, ".the-footer-brand").getBoundingClientRect();
      const socials = pick(screen, ".the-footer-socials").getBoundingClientRect();
      const bottom = pick(screen, ".the-footer-bottom").getBoundingClientRect();

      expect(lines(pick(screen, ".the-footer-tagline"))).toBe(2);
      expect(socials.top).toBeGreaterThanOrEqual(brand.bottom);
      expect(bottom.top).toBeGreaterThan(socials.bottom);
      near(box(screen, ".the-footer-brand").left, 20);
      near(box(screen, ".the-footer-socials").left, 20);
      near(box(screen, ".the-footer-logo").top, 48);
      near(box(screen, ".the-footer-top").bottom, 28);
      near(box(screen, ".the-footer").height, 390, 2);
    });

    it("pads the section like the mockup on desktop", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      near(box(screen, ".the-footer-logo").top, 64);
      near(box(screen, ".the-footer-top").bottom, 36);
      near(box(screen, ".the-footer-rule").top - box(screen, ".the-footer-row").top, 56 + 40, 2);
      near(box(screen, ".the-footer-bottom").top - box(screen, ".the-footer-rule").top, 41);
    });

    it.each([
      { width: 1440, height: 900 },
      { width: 1024, height: 900 },
      { width: 768, height: 900 },
      { width: 390, height: 780 },
    ])("does not overflow in ru at $width", async ({ width, height }) => {
      const screen = await renderCase({ width, height, locale: "ru" });

      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      expect(pick(screen, ".the-footer-row").getBoundingClientRect().width).toBeLessThanOrEqual(
        width,
      );
    });

    it("sizes the socials like the mockup", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const [first, second] = pickAll(screen, ".home-contact-social").map((item) =>
        item.getBoundingClientRect(),
      );
      const icon = getComputedStyle(pick(screen, ".home-contact-social"), "::before");

      near(first!.width, 44);
      near(first!.height, 44);
      near(second!.left - first!.right, 10);
      near(Number.parseFloat(icon.width), 26);
      near(Number.parseFloat(icon.height), 26);
    });
  });

  it("follows the theme with the day layer and the colours of the line", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const day = pick<HTMLElement>(screen, ".the-footer-day");
    const line = pick<HTMLElement>(screen, ".the-footer-line");
    const logo = pick<HTMLElement>(screen, ".the-footer-logo");
    const social = pick<HTMLElement>(screen, ".home-contact-social");

    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");
    expect(getComputedStyle(logo).color).toBe(resolve("--color-primary-ink"));

    document.documentElement.dataset.theme = "cyber-sakura";
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(day, "visibility")).toBe(true);
    expect(transitioning(line, "--the-footer-line-edge")).toBe(true);
    expect(transitioning(line, "--the-footer-line-mid")).toBe(true);
    expect(transitioning(logo, "color")).toBe(true);
    expect(transitioning(social, "clip-path")).toBe(true);
    expect(transitioning(social, "opacity", "::after")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
    expect(getComputedStyle(logo).color).toBe(resolve("--color-base-content"));
  });

  it("recolours the top line from the theme tokens", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const line = pick<HTMLElement>(screen, ".the-footer-line");

    function paint(property: string) {
      line.style.color = `var(${property})`;
      const color = getComputedStyle(line).color;
      line.style.color = "";
      return color;
    }

    expect(paint("--the-footer-line-edge")).toBe(resolve("--color-primary"));
    expect(paint("--the-footer-line-mid")).toBe(resolve("--color-secondary"));
    document.documentElement.dataset.theme = "cyber-sakura";
    finishAnimations();
    expect(paint("--the-footer-line-edge")).toBe(resolve("--color-secondary"));
    expect(paint("--the-footer-line-mid")).toBe(resolve("--color-primary"));
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const day = pick<HTMLElement>(screen, ".the-footer-day");

      document.documentElement.dataset.theme = "cyber-sakura";
      await nextTick();
      expect(transitioning(day, "opacity")).toBe(false);
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
      expect(getComputedStyle(day).opacity).toBe("1");
      expect(getComputedStyle(day).visibility).toBe("visible");
    });
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(TheFooter) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="footer"');
    expect(html).toContain("<footer");
    expect(html).not.toContain("home-slide");
    expect(html).not.toContain("the-footer-nav");
    expect(html).toContain(`© ${new Date().getFullYear()} Michael`);
  });
});
