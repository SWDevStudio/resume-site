import { h, nextTick, ref } from "vue";
import { createI18n } from "vue-i18n";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheHeader from "./TheHeader.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

const mocks = vi.hoisted(() => ({
  setLocale: vi.fn(),
  toggle: vi.fn(),
}));

const current = ref<Locale>("ru");

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({
    locale: current,
    locales: ["ru", "en"],
    prepare: vi.fn(),
    setLocale: mocks.setLocale,
  }),
}));

vi.mock("~/composables/useTheme", () => ({
  useTheme: () => ({ toggle: mocks.toggle }),
  readThemeSettleMs: () => 550,
}));

interface HeaderCase {
  name: string;
  width: string;
  locale?: Locale;
  underlay?: boolean;
  open?: "lang" | "menu";
  wrapper?: string;
  reference?: boolean;
}

interface Viewport {
  width: number;
  height: number;
}

const viewports: Record<string, Viewport> = {
  "w-360": { width: 1440, height: 900 },
  "w-192": { width: 768, height: 900 },
  "w-97.5": { width: 390, height: 900 },
};

const themes = ["torii-synth", "cyber-sakura"];

const cases: HeaderCase[] = [
  { name: "desktop", width: "w-360", underlay: true },
  { name: "desktop-blog", width: "w-360", underlay: true },
  { name: "desktop-en", width: "w-360", locale: "en", underlay: true },
  {
    name: "desktop-lang-open",
    width: "w-360",
    underlay: true,
    open: "lang",
    wrapper: "h-72",
  },
  { name: "tablet", width: "w-192", underlay: true },
  {
    name: "tablet-lang-open",
    width: "w-192",
    underlay: true,
    open: "lang",
    wrapper: "h-72",
  },
  { name: "mobile", width: "w-97.5", underlay: true },
  {
    name: "mobile-menu-open",
    width: "w-97.5",
    underlay: true,
    open: "menu",
    wrapper: "h-96",
  },
  {
    name: "mobile-lang-open",
    width: "w-97.5",
    underlay: true,
    open: "lang",
    wrapper: "h-72",
  },
];

const switchCases: HeaderCase[] = [
  { name: "desktop", width: "w-360", underlay: true },
  {
    name: "desktop-lang-open",
    width: "w-360",
    underlay: true,
    open: "lang",
    wrapper: "h-72",
  },
  { name: "mobile", width: "w-97.5", underlay: true },
  {
    name: "mobile-menu-open",
    width: "w-97.5",
    underlay: true,
    open: "menu",
    wrapper: "h-96",
  },
];

function finishAnimations() {
  for (const animation of document.getAnimations()) animation.finish();
}

function advanceAnimations() {
  for (const animation of document.getAnimations()) animation.currentTime = 100;
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

async function renderCase(item: HeaderCase) {
  const viewport = viewports[item.width];
  if (viewport) await page.viewport(viewport.width, viewport.height);
  current.value = item.locale ?? "ru";
  const i18n = createI18n({
    legacy: false,
    locale: current.value,
    messages: { ru, en },
  });
  const screen = await render(
    () =>
      h(
        "div",
        {
          class: [
            "relative transform-gpu bg-base-100 font-body text-base-content",
            item.width,
            item.wrapper ?? "h-48",
          ],
        },
        [
          item.underlay
            ? h("div", { class: "absolute inset-0 flex" }, [
                h("div", { class: "grow bg-primary" }),
                h("div", { class: "grow bg-secondary" }),
                h("div", { class: "grow bg-accent" }),
              ])
            : null,
          h(TheHeader),
          item.reference
            ? h("div", { class: "container" }, h("div", { class: "container-probe h-4" }))
            : null,
        ],
      ),
    { global: { plugins: [i18n] } },
  );

  screen.container.getBoundingClientRect();
  if (item.open === "lang") {
    screen.container.querySelector<HTMLElement>(".the-header-lang-trigger")!.click();
  }
  if (item.open === "menu") {
    screen.container.querySelector<HTMLElement>(".the-header-burger")!.click();
  }
  await nextTick();
  finishAnimations();

  return screen;
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('300 1em "Martian Mono"', "Главная Резюме Блог Контакты");
  await document.fonts.load('400 1em "Martian Mono"', "SOWA_DEV");
});

beforeEach(() => {
  mocks.setLocale.mockReset();
  mocks.toggle.mockReset();
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("behavior", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "torii-synth";
  });

  afterEach(() => {
    finishAnimations();
  });

  it("opens and closes the mobile menu", async () => {
    const screen = await renderCase({ name: "x", width: "w-97.5" });
    const burger = screen.container.querySelector<HTMLElement>(".the-header-burger")!;
    const nav = screen.container.querySelector<HTMLElement>(".the-header-nav")!;
    const link = nav.querySelector<HTMLElement>(".the-header-link")!;

    expect(burger.getAttribute("aria-expanded")).toBe("false");
    expect(getComputedStyle(nav).visibility).toBe("hidden");
    expect(getComputedStyle(nav).opacity).toBe("0");
    expect(nav.checkVisibility({ checkVisibilityCSS: true })).toBe(false);
    link.focus();
    expect(document.activeElement).not.toBe(link);

    burger.click();
    await nextTick();
    expect(burger.getAttribute("aria-expanded")).toBe("true");
    expect(transitioning(nav, "opacity")).toBe(true);
    expect(transitioning(nav, "transform")).toBe(true);
    advanceAnimations();
    expect(getComputedStyle(nav).visibility).toBe("visible");
    finishAnimations();
    expect(getComputedStyle(nav).opacity).toBe("1");
    expect(getComputedStyle(nav).transform).toBe("none");
    expect(nav.checkVisibility({ checkVisibilityCSS: true })).toBe(true);
    link.focus();
    expect(document.activeElement).toBe(link);

    link.click();
    await nextTick();
    expect(burger.getAttribute("aria-expanded")).toBe("false");
    expect(transitioning(nav, "opacity")).toBe(true);
    advanceAnimations();
    expect(getComputedStyle(nav).visibility).toBe("visible");
    finishAnimations();
    expect(getComputedStyle(nav).visibility).toBe("hidden");
    expect(getComputedStyle(nav).opacity).toBe("0");

    burger.click();
    await nextTick();
    finishAnimations();
    burger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(burger.getAttribute("aria-expanded")).toBe("false");
    finishAnimations();
    expect(getComputedStyle(nav).visibility).toBe("hidden");
  });

  it("crossfades the burger icon into the close icon", async () => {
    const screen = await renderCase({ name: "x", width: "w-97.5" });
    const burger = screen.container.querySelector<HTMLElement>(".the-header-burger")!;
    const icon = burger.querySelector<HTMLElement>(".the-header-burger-icon")!;
    const label = burger.getAttribute("aria-label");

    expect(getComputedStyle(icon, "::before").opacity).toBe("1");
    expect(getComputedStyle(icon, "::after").opacity).toBe("0");

    burger.click();
    await nextTick();
    expect(burger.getAttribute("aria-label")).not.toBe(label);
    expect(transitioning(icon, "opacity", "::before")).toBe(true);
    expect(transitioning(icon, "opacity", "::after")).toBe(true);
    expect(transitioning(icon, "transform", "::after")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(icon, "::before").opacity).toBe("0");
    expect(getComputedStyle(icon, "::after").opacity).toBe("1");
    expect(getComputedStyle(icon, "::after").transform).toBe("none");

    burger.click();
    await nextTick();
    expect(transitioning(icon, "opacity", "::before")).toBe(true);
    finishAnimations();
    expect(burger.getAttribute("aria-label")).toBe(label);
    expect(getComputedStyle(icon, "::before").opacity).toBe("1");
    expect(getComputedStyle(icon, "::after").opacity).toBe("0");
  });

  it("closes the mobile menu and the language menu one by another", async () => {
    const screen = await renderCase({ name: "x", width: "w-97.5" });
    const burger = screen.container.querySelector<HTMLElement>(".the-header-burger")!;
    const trigger = screen.container.querySelector<HTMLElement>(".the-header-lang-trigger")!;

    burger.click();
    await nextTick();
    trigger.click();
    await nextTick();
    expect(burger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    burger.click();
    await nextTick();
    expect(burger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps the nav inline on tablet and desktop", async () => {
    const screen = await renderCase({ name: "x", width: "w-192" });
    const nav = getComputedStyle(screen.container.querySelector(".the-header-nav")!);

    expect(nav.display).toBe("block");
    expect(nav.visibility).toBe("visible");
    expect(nav.opacity).toBe("1");
    expect(nav.transitionProperty).toBe("none");
    expect(getComputedStyle(screen.container.querySelector(".the-header-burger")!).display).toBe(
      "none",
    );
  });

  it.each([
    { width: 1920, height: 1080 },
    { width: 2560, height: 1600 },
  ])("keeps the desktop layout at $width x $height", async ({ width, height }) => {
    await page.viewport(width, height);
    const screen = await renderCase({ name: "x", width: "w-full" });
    const nav = getComputedStyle(screen.container.querySelector(".the-header-nav")!);
    const burger = getComputedStyle(screen.container.querySelector(".the-header-burger")!);
    const wrapper = screen.container.firstElementChild!;
    const header = screen.container.querySelector<HTMLElement>(".the-header")!;

    expect(nav.display).toBe("block");
    expect(nav.visibility).toBe("visible");
    expect(burger.display).toBe("none");
    expect(header.getBoundingClientRect().width).toBe(wrapper.getBoundingClientRect().width);
    expect(header.getBoundingClientRect().left).toBe(wrapper.getBoundingClientRect().left);

    await page.viewport(1440, 900);
  });

  it.each([
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1600 },
  ])("takes width and side gaps from .container at $width x $height", async ({ width, height }) => {
    await page.viewport(width, height);
    const screen = await renderCase({ name: "x", width: "w-full", reference: true });
    const bar = screen.container.querySelector<HTMLElement>(".the-header-bar")!;
    const reference = screen.container.querySelector<HTMLElement>(".container")!;
    const probe = screen.container.querySelector<HTMLElement>(".container-probe")!;
    const logo = screen.container.querySelector<HTMLElement>(".the-header-logo")!;
    const end = screen.container.querySelector<HTMLElement>(".the-header-end")!;
    const barStyle = getComputedStyle(bar);
    const referenceStyle = getComputedStyle(reference);

    expect(bar.classList.contains("container")).toBe(true);
    expect(barStyle.maxWidth).toBe(referenceStyle.maxWidth);
    expect(barStyle.marginLeft).toBe(referenceStyle.marginLeft);
    expect(barStyle.marginRight).toBe(referenceStyle.marginRight);
    expect(barStyle.paddingLeft).toBe(referenceStyle.paddingLeft);
    expect(barStyle.paddingRight).toBe(referenceStyle.paddingRight);
    expect(bar.getBoundingClientRect().width).toBe(reference.getBoundingClientRect().width);
    expect(
      Math.abs(logo.getBoundingClientRect().left - probe.getBoundingClientRect().left),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(end.getBoundingClientRect().right - probe.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);

    await page.viewport(1440, 900);
  });

  it("opens the language menu and switches locale", async () => {
    const screen = await renderCase({ name: "x", width: "w-360" });
    const trigger = screen.container.querySelector<HTMLElement>(".the-header-lang-trigger")!;
    const menu = screen.container.querySelector<HTMLElement>(".the-header-menu")!;
    const items = [...menu.querySelectorAll<HTMLElement>(".the-header-menu-item")];
    const checks = [...menu.querySelectorAll<HTMLElement>(".the-header-menu-check")];

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(getComputedStyle(menu).visibility).toBe("hidden");
    expect(getComputedStyle(menu).opacity).toBe("0");
    items[0]!.focus();
    expect(document.activeElement).not.toBe(items[0]);

    trigger.click();
    await nextTick();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(transitioning(menu, "opacity")).toBe(true);
    expect(transitioning(menu, "transform")).toBe(true);
    advanceAnimations();
    expect(getComputedStyle(menu).visibility).toBe("visible");
    finishAnimations();
    expect(getComputedStyle(menu).opacity).toBe("1");
    expect(getComputedStyle(menu).transform).toBe("none");
    expect(menu.checkVisibility({ checkVisibilityCSS: true })).toBe(true);
    items[0]!.focus();
    expect(document.activeElement).toBe(items[0]);

    expect(items.map((item) => item.lang)).toEqual(["ru", "en"]);
    expect(items.map((item) => item.getAttribute("aria-current"))).toEqual(["true", null]);
    expect(checks.map((check) => getComputedStyle(check).opacity)).toEqual(["1", "0"]);

    items[1]!.click();
    await nextTick();
    expect(mocks.setLocale).toHaveBeenCalledWith("en");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(transitioning(menu, "opacity")).toBe(true);
    advanceAnimations();
    expect(getComputedStyle(menu).visibility).toBe("visible");
    finishAnimations();
    expect(getComputedStyle(menu).visibility).toBe("hidden");
    expect(getComputedStyle(menu).opacity).toBe("0");
  });

  it("animates the current item of the language menu", async () => {
    const screen = await renderCase({ name: "x", width: "w-360", open: "lang" });
    const menu = screen.container.querySelector<HTMLElement>(".the-header-menu")!;
    const items = [...menu.querySelectorAll<HTMLElement>(".the-header-menu-item")];
    const checks = [...menu.querySelectorAll<HTMLElement>(".the-header-menu-check")];
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    expect(getComputedStyle(menu).contentVisibility).toBe("visible");
    items[0]!.removeAttribute("aria-current");
    items[1]!.setAttribute("aria-current", "true");
    expect(transitioning(items[1]!, "background-color")).toBe(true);
    expect(transitioning(checks[0]!, "opacity")).toBe(true);
    expect(transitioning(checks[1]!, "opacity")).toBe(true);
    finishAnimations();
    expect(checks.map((check) => getComputedStyle(check).opacity)).toEqual(["0", "1"]);
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    afterEach(async () => {
      await setReducedMotion("no-preference");
    });

    it("switches the mobile menu without transitions", async () => {
      const screen = await renderCase({ name: "x", width: "w-97.5" });
      const burger = screen.container.querySelector<HTMLElement>(".the-header-burger")!;
      const nav = screen.container.querySelector<HTMLElement>(".the-header-nav")!;
      const icon = burger.querySelector<HTMLElement>(".the-header-burger-icon")!;

      expect(getComputedStyle(nav).visibility).toBe("hidden");

      burger.click();
      await nextTick();
      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(nav).visibility).toBe("visible");
      expect(getComputedStyle(nav).opacity).toBe("1");
      expect(getComputedStyle(icon, "::before").opacity).toBe("0");
      expect(getComputedStyle(icon, "::after").opacity).toBe("1");

      burger.click();
      await nextTick();
      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(nav).visibility).toBe("hidden");
      expect(getComputedStyle(icon, "::before").opacity).toBe("1");
    });

    it("switches the language menu without transitions", async () => {
      const screen = await renderCase({ name: "x", width: "w-360" });
      const trigger = screen.container.querySelector<HTMLElement>(".the-header-lang-trigger")!;
      const menu = screen.container.querySelector<HTMLElement>(".the-header-menu")!;

      trigger.click();
      await nextTick();
      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(menu).visibility).toBe("visible");
      expect(getComputedStyle(menu).opacity).toBe("1");

      trigger.click();
      await nextTick();
      expect(document.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(menu).visibility).toBe("hidden");
    });
  });

  it("fixes the header to the top of the page", async () => {
    const screen = await renderCase({ name: "x", width: "w-360" });
    const header = screen.container.querySelector<HTMLElement>(".the-header")!;

    expect(getComputedStyle(header).position).toBe("fixed");
    expect(getComputedStyle(header).containerType).toBe("inline-size");
  });

  it("toggles the theme", async () => {
    const screen = await renderCase({ name: "x", width: "w-360" });

    screen.container.querySelector<HTMLElement>(".the-header-theme")!.click();
    expect(mocks.toggle).toHaveBeenCalledTimes(1);
  });
});

describe("theme switch", () => {
  afterEach(() => {
    for (const animation of document.getAnimations()) animation.finish();
  });

  it.each(switchCases)("$name", async (item) => {
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderCase(item);
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

describe.each(themes)("%s menu transition", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  afterEach(() => {
    finishAnimations();
  });

  it("mobile-menu-mid", async () => {
    const screen = await renderCase({
      name: "mobile-menu-mid",
      width: "w-97.5",
      underlay: true,
      wrapper: "h-96",
    });
    screen.container.getBoundingClientRect();
    screen.container.querySelector<HTMLElement>(".the-header-burger")!.click();
    await nextTick();

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-mobile-menu-mid`, {
        screenshotOptions: { animations: "allow" },
      });
  });
});
