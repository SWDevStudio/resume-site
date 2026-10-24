import { h } from "vue";
import { createI18n } from "vue-i18n";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Locale } from "~/assets/const";
import posts from "~/assets/data/blog/posts";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import type { BlogPostHead, BlogPostSummary } from "~/assets/api/types/blog";
import BlogKindLabel from "./BlogKindLabel.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface LabelCase {
  name: string;
  slug: string;
  full: boolean;
  locale: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: LabelCase[] = [
  { name: "article", slug: "seo-for-llms", full: false, locale: "en" },
  { name: "article-full", slug: "seo-for-llms", full: true, locale: "en" },
  { name: "tool", slug: "llms-txt-gen", full: false, locale: "en" },
  { name: "tool-full", slug: "llms-txt-gen", full: true, locale: "en" },
  { name: "video", slug: "booking-calendar-nextjs", full: false, locale: "en" },
  { name: "video-full", slug: "booking-calendar-nextjs", full: true, locale: "en" },
  { name: "article-ru", slug: "seo-for-llms", full: true, locale: "ru" },
  { name: "tool-ru", slug: "llms-txt-gen", full: true, locale: "ru" },
  { name: "video-ru", slug: "booking-calendar-nextjs", full: false, locale: "ru" },
];

function postOf(slug: string) {
  return (posts as unknown as BlogPostSummary[]).find(
    (post) => post.slug === slug,
  )! as BlogPostHead;
}

function setTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
}

async function renderLabel(
  item: Pick<LabelCase, "slug" | "full" | "locale">,
  props: Record<string, unknown> = {},
) {
  document.documentElement.lang = item.locale;
  const screen = await render(
    () =>
      h(
        "div",
        { class: "inline-block bg-base-100 p-4 font-body" },
        h(BlogKindLabel, { post: postOf(item.slug), full: item.full, ...props }),
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

type Screen = Awaited<ReturnType<typeof renderLabel>>;

function label(screen: Screen) {
  return screen.container.querySelector<HTMLElement>(".blog-kind-label")!;
}

function parts(screen: Screen) {
  return [...screen.container.querySelectorAll(".blog-kind-label-part")].map((part) =>
    part.textContent?.replace(/\s+/g, " ").trim(),
  );
}

function kind(screen: Screen) {
  return screen.container
    .querySelector(".blog-kind-label-kind")!
    .textContent?.replace(/\s+/g, " ")
    .trim();
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

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Martian Mono"', "ARTICLE 8 MIN READ ★ [128] TYPESCRIPT");
  await document.fonts.load('400 1em "Martian Mono"', "СТАТЬЯ ВИДЕОУРОК МИН ЧТЕНИЯ ИНСТРУМЕНТ");
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
    const screen = await renderLabel(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("shows the kind and the reading time of an article, with the date only in the full label", async () => {
    const short = await renderLabel(cases[0]!);
    expect(kind(short)).toBe("Article");
    expect(parts(short)).toEqual(["8 min read"]);

    const full = await renderLabel(cases[1]!);
    expect(parts(full)).toEqual(["8 min read", "[12 Sep 2026]"]);
  });

  it("shows the platform, the stars and the language of a tool, with the version only in the full label", async () => {
    const short = await renderLabel(cases[2]!);
    expect(kind(short)).toBe("GitHub tool");
    expect(parts(short)).toEqual(["★ [128]", "TypeScript"]);

    const full = await renderLabel(cases[3]!);
    expect(parts(full)).toEqual(["★ [128]", "TypeScript", "[v1.2.0]"]);
  });

  it("shows the duration of a video, with the date only in the full label", async () => {
    const short = await renderLabel(cases[4]!);
    expect(kind(short)).toBe("Video lesson");
    expect(parts(short)).toEqual(["24:18"]);

    const full = await renderLabel(cases[5]!);
    expect(parts(full)).toEqual(["24:18", "[20 Sep 2026]"]);
  });

  it("translates the kind and the reading time and keeps the platform in English", async () => {
    const article = await renderLabel(cases[6]!);
    expect(kind(article)).toBe("Статья");
    expect(parts(article)).toEqual(["8 мин чтения", "[12 Sep 2026]"]);

    const tool = await renderLabel(cases[7]!);
    const platform = tool.container.querySelector<HTMLElement>(
      ".blog-kind-label-kind [lang='en']",
    )!;
    expect(kind(tool)).toBe("Инструмент GitHub");
    expect(platform.textContent?.trim()).toBe("GitHub");
    expect(platform.hasAttribute("data-atom-skip")).toBe(true);

    const video = await renderLabel(cases[8]!);
    expect(kind(video)).toBe("Видеоурок");
  });

  it("marks the technical language of a tool as English and leaves the translated parts alone", async () => {
    const screen = await renderLabel(cases[7]!);
    const language = screen.container.querySelectorAll(".blog-kind-label-part")[1]!;

    expect(language.getAttribute("lang")).toBe("en");
    expect(language.hasAttribute("data-atom-skip")).toBe(true);
    expect(
      screen.container.querySelectorAll(".blog-kind-label-part")[0]!.hasAttribute("lang"),
    ).toBe(false);
  });

  it("takes another platform name from the props", async () => {
    const screen = await renderLabel(cases[2]!, { platform: "GitLab" });

    expect(kind(screen)).toBe("GitLab tool");
  });
});

describe("look", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("sets the capital letters, the 12px size and the wide spacing", async () => {
    const element = label(await renderLabel(cases[0]!));
    const style = getComputedStyle(element);

    expect(style.textTransform).toBe("uppercase");
    expect(Number.parseFloat(style.fontSize)).toBeCloseTo(12, 1);
    expect(Number.parseFloat(style.letterSpacing)).toBeCloseTo(12 * 0.18, 1);
  });

  it("keeps the date and the version in their own case", async () => {
    const full = await renderLabel(cases[3]!);
    const [, , version] = full.container.querySelectorAll(".blog-kind-label-part");

    expect(getComputedStyle(version!).textTransform).toBe("none");
    expect(
      getComputedStyle(full.container.querySelector(".blog-kind-label-part")!).textTransform,
    ).toBe("uppercase");
  });

  it("separates the parts with a dot", async () => {
    const screen = await renderLabel(cases[1]!);

    for (const part of screen.container.querySelectorAll(".blog-kind-label-part")) {
      expect(getComputedStyle(part, "::before").content).toBe('"·"');
    }
  });

  it.each([
    { index: 0, token: "--color-primary-ink" },
    { index: 2, token: "--color-secondary-ink" },
    { index: 4, token: "--color-accent-ink" },
  ])("paints the label of the case $index with the ink of its tone", async ({ index, token }) => {
    const element = label(await renderLabel(cases[index]!));

    expect(getComputedStyle(element).color).toBe(resolveColor(token));
  });

  it("turns the color with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderLabel(cases[0]!);
    const before = getComputedStyle(label(screen)).color;
    setTheme("cyber-sakura");

    expect(
      document
        .getAnimations()
        .some(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "color" &&
            (animation.effect as KeyframeEffect).target === label(screen),
        ),
    ).toBe(true);
    finishAnimations();
    expect(getComputedStyle(label(screen)).color).not.toBe(before);
  });
});
