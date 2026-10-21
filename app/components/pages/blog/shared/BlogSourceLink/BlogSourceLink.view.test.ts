import { h } from "vue";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Locale } from "~/assets/const";
import posts from "~/assets/data/blog/posts";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import type { BlogPostSummary } from "~/types/blog";
import BlogSourceLink from "./BlogSourceLink.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface LinkCase {
  name: string;
  slug: string;
  phrase: boolean;
  locale: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: LinkCase[] = [
  { name: "article", slug: "seo-for-llms", phrase: true, locale: "en" },
  { name: "tool", slug: "llms-txt-gen", phrase: true, locale: "en" },
  { name: "video", slug: "booking-calendar-nextjs", phrase: true, locale: "en" },
  { name: "article-name", slug: "seo-for-llms", phrase: false, locale: "en" },
  { name: "tool-name", slug: "llms-txt-gen", phrase: false, locale: "en" },
  { name: "video-name", slug: "booking-calendar-nextjs", phrase: false, locale: "en" },
  { name: "article-ru", slug: "seo-for-llms", phrase: true, locale: "ru" },
  { name: "tool-ru", slug: "llms-txt-gen", phrase: true, locale: "ru" },
  { name: "video-ru", slug: "booking-calendar-nextjs", phrase: true, locale: "ru" },
];

function postOf(slug: string) {
  return (posts as unknown as BlogPostSummary[]).find((post) => post.slug === slug)!;
}

function setTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
}

async function renderLink(item: Pick<LinkCase, "slug" | "phrase" | "locale">) {
  document.documentElement.lang = item.locale;
  const post = postOf(item.slug);
  const screen = await render(
    () =>
      h(
        "div",
        { class: "inline-block bg-base-100 p-4 font-body" },
        h(BlogSourceLink, { source: post.source, kind: post.kind, phrase: item.phrase }),
      ),
    {
      global: {
        plugins: [createI18n({ legacy: false, locale: item.locale, messages: { ru, en } })],
      },
    },
  );
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderLink>>;

function link(screen: Screen) {
  return screen.container.querySelector<HTMLAnchorElement>(".blog-source-link")!;
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function resolveColor(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
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
  await document.fonts.load('400 1em "Martian Mono"', "Original on habr.com Repository on GitHub");
  await document.fonts.load('400 1em "Martian Mono"', "Оригинал на Репозиторий на Смотреть на");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(() => {
  finishAnimations();
  document.documentElement.lang = "en";
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderLink(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { index: 0, expected: "Original on habr.com" },
    { index: 1, expected: "Repository on GitHub" },
    { index: 2, expected: "Watch on YouTube" },
    { index: 3, expected: "habr.com" },
    { index: 4, expected: "GitHub" },
    { index: 5, expected: "YouTube" },
    { index: 6, expected: "Оригинал на habr.com" },
    { index: 7, expected: "Репозиторий на GitHub" },
    { index: 8, expected: "Смотреть на YouTube" },
  ])("says $expected", async ({ index, expected }) => {
    const screen = await renderLink(cases[index]!);

    expect(text(screen.container.querySelector(".blog-source-link-text"))).toBe(expected);
  });

  it("keeps the platform name English and out of the language switch", async () => {
    const screen = await renderLink(cases[7]!);
    const name = screen.container.querySelector(".blog-source-link-text [lang='en']")!;

    expect(name.textContent?.trim()).toBe("GitHub");
    expect(name.hasAttribute("data-atom-skip")).toBe(true);
  });

  it("opens the original in a new tab without leaking the opener", async () => {
    const screen = await renderLink(cases[0]!);
    const anchor = link(screen);

    expect(anchor.getAttribute("href")).toBe("https://habr.com/");
    expect(anchor.getAttribute("target")).toBe("_blank");
    expect(anchor.getAttribute("rel")).toBe("noopener noreferrer");
    expect(
      screen.container.querySelector(".blog-source-link-icon")!.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});

describe("look", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("is 44px tall with 14px text, an 8px gap and a 12px icon", async () => {
    const screen = await renderLink(cases[0]!);
    const anchor = link(screen);
    const icon = screen.container.querySelector(".blog-source-link-icon")!.getBoundingClientRect();

    expect(anchor.getBoundingClientRect().height).toBeCloseTo(44, 0);
    expect(Number.parseFloat(getComputedStyle(anchor).fontSize)).toBeCloseTo(14, 1);
    expect(Number.parseFloat(getComputedStyle(anchor).columnGap)).toBeCloseTo(8, 1);
    expect(icon.width).toBeCloseTo(12, 1);
    expect(icon.height).toBeCloseTo(12, 1);
  });

  it("underlines the text one pixel thick, three pixels away, and not the icon", async () => {
    const screen = await renderLink(cases[0]!);
    const style = getComputedStyle(screen.container.querySelector(".blog-source-link-text")!);

    expect(style.textDecorationLine).toBe("underline");
    expect(Number.parseFloat(style.textDecorationThickness)).toBeCloseTo(1, 1);
    expect(Number.parseFloat(style.textUnderlineOffset)).toBeCloseTo(3, 1);
    expect(getComputedStyle(link(screen)).textDecorationLine).toBe("none");
  });

  it.each([
    { index: 0, token: "--color-primary-ink" },
    { index: 1, token: "--color-secondary-ink" },
    { index: 2, token: "--color-accent-ink" },
  ])("paints the link of the case $index with the ink of its tone", async ({ index, token }) => {
    const screen = await renderLink(cases[index]!);

    expect(getComputedStyle(link(screen)).color).toBe(resolveColor(token));
  });
});

describe("state animations", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("lights the link and moves the icon on hover", async () => {
    const screen = await renderLink(cases[1]!);
    const anchor = link(screen);
    const icon = screen.container.querySelector(".blog-source-link-icon")!;
    const idle = getComputedStyle(anchor).color;

    await userEvent.hover(anchor);
    expect(transitioning(anchor, "color")).toBe(true);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(anchor).color).toBe(resolveColor("--color-base-content"));
    expect(getComputedStyle(anchor).color).not.toBe(idle);
    expect(Number.parseFloat(getComputedStyle(icon).translate)).toBeGreaterThan(0);
  });

  it("draws the brand outline on keyboard focus and not on click focus", async () => {
    const screen = await renderLink(cases[0]!);
    const anchor = link(screen);

    expect(getComputedStyle(anchor).outlineColor).toBe("rgba(0, 0, 0, 0)");
    await userEvent.tab();
    expect(document.activeElement).toBe(anchor);
    expect(transitioning(anchor, "outline-color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(anchor).outlineColor).toBe(resolveColor("--color-brand"));
    expect(Number.parseFloat(getComputedStyle(anchor).outlineWidth)).toBeCloseTo(2, 1);
    expect(getComputedStyle(anchor).color).toBe(resolveColor("--color-base-content"));
  });

  it("does not transition with reduced motion", async () => {
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    const screen = await renderLink(cases[0]!);
    const anchor = link(screen);
    const icon = screen.container.querySelector(".blog-source-link-icon")!;

    await userEvent.hover(anchor);

    expect(transitioning(anchor, "color")).toBe(false);
    expect(transitioning(icon, "translate")).toBe(false);
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });
  });

  it("turns the ink with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderLink(cases[0]!);
    const before = getComputedStyle(link(screen)).color;
    setTheme("cyber-sakura");

    expect(transitioning(link(screen), "color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(link(screen)).color).not.toBe(before);
    expect(getComputedStyle(link(screen)).color).toBe(resolveColor("--color-primary-ink"));
  });
});
