import type { VNode } from "vue";
import { h } from "vue";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

export interface CardCase {
  name: string;
  wrapper: string;
  view: () => VNode;
}

export const themes = ["torii-synth", "cyber-sakura"];

export const renderCard = async (item: CardCase) => {
  const screen = await render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-12 font-body font-light text-base-content" },
      h("div", { class: item.wrapper }, item.view()),
    ),
  );
  await Promise.all(
    Array.from(screen.container.querySelectorAll("img"), (image) => image.decode()),
  );
  return screen;
};

export async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

export const animationsIn = (root: Element) =>
  document.getAnimations().filter((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    return target instanceof Node && root.contains(target);
  });

export const finishAnimations = () => {
  for (const animation of document.getAnimations()) animation.finish();
};

export function loadCardFonts() {
  beforeAll(async () => {
    await document.fonts.load('300 1em "Martian Mono"');
    await document.fonts.load('400 1em "Martian Mono"');
    await document.fonts.load('1em "Righteous"', "Qwixit Frontend 01");
    await document.fonts.load('1em "Share Tech Mono"', "I build digital products");
  });
}

export function describeScreenshots(cases: CardCase[]) {
  describe.each(themes)("%s", (theme) => {
    beforeEach(() => {
      document.documentElement.dataset.theme = theme;
    });

    it.each(cases)("$name", async (item) => {
      const screen = await renderCard(item);

      await expect
        .element(page.elementLocator(screen.container.firstElementChild!))
        .toMatchScreenshot(`${theme}-${item.name}`);
    });
  });
}

export function describeHover(boxSelector: string, cases: CardCase[]) {
  describe.each(themes)("hover %s", (theme) => {
    beforeEach(() => {
      document.documentElement.dataset.theme = theme;
    });

    afterEach(async () => {
      finishAnimations();
      await userEvent.unhover(page.elementLocator(document.body));
      finishAnimations();
    });

    it.each(cases)("animates the frame on hover $name", async (item) => {
      const screen = await renderCard(item);
      const card = screen.container.querySelector<HTMLElement>(boxSelector)!;
      const frame = card.querySelector<HTMLElement>(".card-frame")!;
      const line = () => getComputedStyle(frame, "::before").backgroundColor;
      const glow = () => getComputedStyle(frame).filter;
      const restLine = line();
      const restGlow = glow();

      await userEvent.hover(page.elementLocator(card));
      await expect.poll(() => document.getAnimations().length).toBeGreaterThan(0);
      finishAnimations();

      expect(line()).not.toBe(restLine);
      expect(glow()).not.toBe(restGlow);

      await userEvent.unhover(page.elementLocator(card));
      await expect.poll(() => document.getAnimations().length).toBeGreaterThan(0);
      finishAnimations();

      expect(line()).toBe(restLine);
      expect(glow()).toBe(restGlow);
    });

    it.each(cases)("$name hovered", async (item) => {
      const screen = await renderCard(item);
      const card = screen.container.querySelector<HTMLElement>(boxSelector)!;

      await userEvent.hover(page.elementLocator(card));
      await expect.poll(() => document.getAnimations().length).toBeGreaterThan(0);
      finishAnimations();

      await expect
        .element(page.elementLocator(screen.container.firstElementChild!))
        .toMatchScreenshot(`${theme}-${item.name}-hover`);
    });
  });
}

export function describeThemeSwitch(cases: CardCase[]) {
  describe("theme switch", () => {
    afterEach(finishAnimations);

    it.each(cases)("$name", async (item) => {
      document.documentElement.dataset.theme = "torii-synth";
      document.documentElement.getBoundingClientRect();
      finishAnimations();
      const screen = await renderCard(item);
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
}
