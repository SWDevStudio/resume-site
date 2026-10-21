import { h } from "vue";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { BlogTone } from "~/types/blog";
import BlogTag from "./BlogTag.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface TagCase {
  name: string;
  tone: BlogTone;
  small: boolean;
  text: string;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: TagCase[] = [
  { name: "primary", tone: "primary", small: false, text: "Next.js" },
  { name: "secondary", tone: "secondary", small: false, text: "Open source" },
  { name: "accent", tone: "accent", small: false, text: "Tutorial" },
  { name: "primary-small", tone: "primary", small: true, text: "TypeScript" },
  { name: "secondary-small", tone: "secondary", small: true, text: "★ [128] stars" },
  { name: "accent-small", tone: "accent", small: true, text: "MIT" },
];

function setTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
}

async function renderTag(item: Pick<TagCase, "tone" | "small" | "text">) {
  const screen = await render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-4 font-body" },
      h(BlogTag, { tone: item.tone, small: item.small }, () => item.text),
    ),
  );
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderTag>>;

function tag(screen: Screen) {
  return screen.container.querySelector<HTMLElement>(".blog-tag")!;
}

function near(value: number, expected: number, tolerance = 0.2) {
  expect(Math.abs(value - expected), `${value} vs ${expected}`).toBeLessThanOrEqual(tolerance);
}

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
}

function transitioning(element: Element, property: string) {
  return document.getAnimations().some((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === property &&
      effect?.target === element
    );
  });
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Martian Mono"', "Next.js Open source Tutorial ★ [128] stars");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderTag(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it("turns the cut into the pill in the middle of the switch", async () => {
    setTheme("torii-synth");
    const screen = await renderTag(cases[1]!);
    setTheme("cyber-sakura");

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot("switch-secondary", { screenshotOptions: { animations: "allow" } });
  });

  it("transitions the shape and the colors, and not with reduced motion", async () => {
    setTheme("torii-synth");
    const screen = await renderTag(cases[0]!);
    setTheme("cyber-sakura");

    for (const property of [
      "clip-path",
      "border-top-left-radius",
      "background-color",
      "border-top-color",
    ]) {
      expect(transitioning(tag(screen), property), property).toBe(true);
    }
    finishAnimations();
    screen.unmount();

    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    setTheme("torii-synth");
    const reduced = await renderTag(cases[0]!);
    setTheme("cyber-sakura");

    expect(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation instanceof CSSTransition &&
            (animation.effect as KeyframeEffect).target === tag(reduced),
        ),
    ).toHaveLength(0);
  });
});

describe("shape and size", () => {
  it("draws the Torii Synth tag with a 5px cut and no radius", async () => {
    setTheme("torii-synth");
    const element = tag(await renderTag(cases[0]!));
    const style = getComputedStyle(element);

    near(Number.parseFloat(style.borderTopLeftRadius), 0);
    near(Number.parseFloat(style.clipPath.slice(8)), 5);
    near(Number.parseFloat(style.borderTopWidth), 1);
  });

  it("draws the Cyber Sakura tag as a pill with no cut", async () => {
    setTheme("cyber-sakura");
    const element = tag(await renderTag(cases[0]!));
    const style = getComputedStyle(element);

    near(Number.parseFloat(style.borderTopLeftRadius), 32);
    near(Number.parseFloat(style.clipPath.slice(8)), 0);
  });

  it("sizes the regular tag to 14px with 4px and 12px padding", async () => {
    setTheme("torii-synth");
    const style = getComputedStyle(tag(await renderTag(cases[0]!)));

    near(Number.parseFloat(style.fontSize), 14);
    near(Number.parseFloat(style.paddingTop), 4);
    near(Number.parseFloat(style.paddingLeft), 12);
    near(Number.parseFloat(style.lineHeight), 21);
  });

  it("sizes the small tag to 12px", async () => {
    setTheme("torii-synth");
    const style = getComputedStyle(tag(await renderTag(cases[3]!)));

    near(Number.parseFloat(style.fontSize), 12);
    near(Number.parseFloat(style.paddingTop), 4);
    near(Number.parseFloat(style.paddingLeft), 12);
  });

  it("tints the tag with its tone and keeps the text in the base color", async () => {
    setTheme("torii-synth");
    const primary = getComputedStyle(tag(await renderTag(cases[0]!)));
    const accent = getComputedStyle(tag(await renderTag(cases[2]!)));

    expect(primary.borderTopColor).not.toBe(accent.borderTopColor);
    expect(primary.backgroundColor).not.toBe(accent.backgroundColor);
    expect(primary.color).toBe(accent.color);
  });

  it("takes the tone from an ancestor when the prop is not given", async () => {
    setTheme("torii-synth");
    const screen = await render(() =>
      h("div", { class: "page-tone page-tone-accent bg-base-100 p-4" }, [
        h(BlogTag, null, () => "Tutorial"),
      ]),
    );
    const own = getComputedStyle(tag(await renderTag(cases[2]!)));

    expect(getComputedStyle(tag(screen)).borderTopColor).toBe(own.borderTopColor);
    expect(tag(screen).classList).not.toContain("page-tone");
  });
});
