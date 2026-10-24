import { h } from "vue";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import posts from "~/assets/data/blog/posts";
import type {
  BlogCover as Cover,
  BlogCoverSize,
  BlogPostSummary,
  BlogTone,
} from "~/assets/api/types/blog";
import BlogCover from "./BlogCover.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface CoverCase {
  name: string;
  slug: string;
  tone: BlogTone;
  size: BlogCoverSize;
  viewport: [number, number];
  box: number;
}

const themes = ["torii-synth", "cyber-sakura"];

const desktop: [number, number] = [1440, 900];
const tablet: [number, number] = [768, 900];
const mobile: [number, number] = [390, 780];

const cases: CoverCase[] = [
  {
    name: "article",
    slug: "seo-for-llms",
    tone: "primary",
    size: "card",
    viewport: desktop,
    box: 784,
  },
  {
    name: "article-scaled",
    slug: "headless-or-classic-cms",
    tone: "primary",
    size: "card",
    viewport: desktop,
    box: 784,
  },
  {
    name: "article-small-line",
    slug: "core-web-vitals-checklist",
    tone: "primary",
    size: "card",
    viewport: desktop,
    box: 784,
  },
  {
    name: "tool",
    slug: "llms-txt-gen",
    tone: "secondary",
    size: "card",
    viewport: desktop,
    box: 784,
  },
  {
    name: "video",
    slug: "booking-calendar-nextjs",
    tone: "accent",
    size: "card",
    viewport: desktop,
    box: 784,
  },
  {
    name: "video-hero",
    slug: "lighthouse-100",
    tone: "accent",
    size: "hero",
    viewport: desktop,
    box: 784,
  },
  {
    name: "tool-tablet",
    slug: "cwv-watch",
    tone: "secondary",
    size: "hero",
    viewport: tablet,
    box: 704,
  },
  {
    name: "article-compact",
    slug: "seo-for-llms",
    tone: "primary",
    size: "compact",
    viewport: desktop,
    box: 380,
  },
  {
    name: "tool-compact",
    slug: "llms-txt-gen",
    tone: "secondary",
    size: "compact",
    viewport: desktop,
    box: 380,
  },
  {
    name: "video-compact",
    slug: "booking-calendar-nextjs",
    tone: "accent",
    size: "compact",
    viewport: desktop,
    box: 380,
  },
  {
    name: "article-mobile",
    slug: "headless-or-classic-cms",
    tone: "primary",
    size: "card",
    viewport: mobile,
    box: 350,
  },
  {
    name: "tool-mobile",
    slug: "llms-txt-gen",
    tone: "secondary",
    size: "card",
    viewport: mobile,
    box: 350,
  },
  {
    name: "video-mobile",
    slug: "booking-calendar-nextjs",
    tone: "accent",
    size: "card",
    viewport: mobile,
    box: 350,
  },
];

const switchCases = cases.filter((item) =>
  ["tool", "video", "article-scaled", "video-mobile"].includes(item.name),
);

function coverOf(slug: string) {
  return (posts as unknown as BlogPostSummary[]).find((post) => post.slug === slug)!.cover;
}

async function renderCover(
  item: Pick<CoverCase, "tone" | "size" | "viewport" | "box"> & {
    slug?: string;
    cover?: Cover;
  },
  link = false,
) {
  await page.viewport(...item.viewport);
  const cover = item.cover ?? coverOf(item.slug!);
  const node = h(BlogCover, { cover, size: item.size, tone: item.tone });
  const screen = await render(() =>
    h(
      "div",
      { class: "bg-base-100 p-4", style: { width: `${item.box + 32}px` } },
      link ? h("a", { href: "#top", class: "block" }, node) : node,
    ),
  );
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderCover>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function rect(screen: Screen, selector: string) {
  return pick(screen, selector).getBoundingClientRect();
}

function size(screen: Screen, selector: string, index = 0) {
  return Number.parseFloat(getComputedStyle(pickAll(screen, selector)[index]!).fontSize);
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected), `${value} vs ${expected}`).toBeLessThanOrEqual(tolerance);
}

function setTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
}

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
}

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

function transitioning(element: Element, property: string) {
  return document.getAnimations().some((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === property &&
      effect?.target === element &&
      effect.pseudoElement === null
    );
  });
}

function resolveColor(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

beforeAll(async () => {
  await page.viewport(...desktop);
  await document.fonts.load(
    '400 1em "Martian Mono"',
    "robots.txt llms.txt github.com $ npx ✓ 24:18",
  );
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  await setReducedMotion("no-preference");
  await page.viewport(...desktop);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCover(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderCover(item);
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

describe("layout", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { name: "article card", slug: "seo-for-llms", size: "card" as const, widths: [400, 360, 196] },
    { name: "tool card", slug: "llms-txt-gen", size: "card" as const, widths: [400, 360, 196] },
    { name: "article hero", slug: "seo-for-llms", size: "hero" as const, widths: [400, 380, 220] },
    { name: "tool hero", slug: "llms-txt-gen", size: "hero" as const, widths: [400, 380, 220] },
    {
      name: "video hero",
      slug: "booking-calendar-nextjs",
      size: "hero" as const,
      widths: [440, 396, 196],
    },
    {
      name: "video compact",
      slug: "booking-calendar-nextjs",
      size: "compact" as const,
      widths: [190, 170, 196],
    },
    {
      name: "article compact",
      slug: "seo-for-llms",
      size: "compact" as const,
      widths: [190, 170, 196],
    },
  ])(
    "sets the height of the $name at 1440, 768 and 390",
    async ({ slug, size: coverSize, widths }) => {
      for (const [index, viewport] of [desktop, tablet, mobile].entries()) {
        const box = [784, 704, 350][index]!;
        const screen = await renderCover({
          slug,
          tone: "primary",
          size: coverSize,
          viewport,
          box,
        });

        near(rect(screen, ".blog-cover").height, widths[index]!);
        near(rect(screen, ".blog-cover").width, box);
        screen.unmount();
      }
    },
  );

  it("keeps the frame one pixel and the stage inside it", async () => {
    const screen = await renderCover({ ...cases[0]!, viewport: desktop });
    const cover = rect(screen, ".blog-cover");
    const stage = rect(screen, ".page-cover-stage");

    near(stage.left - cover.left, 1, 0.1);
    near(cover.right - stage.right, 1, 0.1);
    near(stage.height, cover.height - 2, 0.1);
  });

  it("is decorative: hidden from readers, English and untouched by the language switch", async () => {
    const screen = await renderCover(cases[0]!);
    const cover = pick(screen, ".blog-cover");

    expect(cover.getAttribute("aria-hidden")).toBe("true");
    expect(cover.getAttribute("lang")).toBe("en");
    expect(cover.hasAttribute("data-atom-skip")).toBe(true);
  });

  it("sizes the cover by its kind and size", async () => {
    const tool = await renderCover({ ...cases[3]!, size: "compact" });
    expect(pick(tool, ".blog-cover").classList).toContain("blog-cover-compact");
    expect(pick(tool, ".blog-cover").classList).toContain("blog-cover-type-terminal");
    expect(pick(tool, ".blog-cover").classList).toContain("page-tone-secondary");
    tool.unmount();

    const video = await renderCover(cases[4]!);
    expect(pick(video, ".blog-cover").classList).toContain("blog-cover-card");
    expect(pick(video, ".blog-cover").classList).toContain("blog-cover-type-video");
    expect(pick(video, ".blog-cover").classList).toContain("page-tone-accent");
  });
});

describe("text cover", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { viewport: desktop, box: 784, expected: 64 },
    { viewport: tablet, box: 704, expected: 58 },
    { viewport: mobile, box: 350, expected: 30 },
  ])("sets the text size to $expected at $viewport", async ({ viewport, box, expected }) => {
    const screen = await renderCover({ ...cases[0]!, viewport, box });

    near(size(screen, ".blog-cover-line"), expected, 0.6);
  });

  it("scales the second line and indents the lines in em of their own size", async () => {
    const screen = await renderCover(cases[1]!);
    const first = pickAll(screen, ".blog-cover-line")[0]!;
    const second = pickAll(screen, ".blog-cover-line")[1]!;

    near(size(screen, ".blog-cover-line", 1), 64 * 0.62, 0.3);
    near(
      second.getBoundingClientRect().left - first.getBoundingClientRect().left,
      2.4 * 64 * 0.62,
      1,
    );
  });

  it("strikes out and mutes the line the data marks", async () => {
    const screen = await renderCover(cases[0]!);
    const [struck, plain] = pickAll(screen, ".blog-cover-line").map((line) =>
      getComputedStyle(line),
    );

    expect(struck!.textDecorationLine).toBe("line-through");
    expect(struck!.opacity).toBe("0.7");
    expect(struck!.color).not.toBe(plain!.color);
    expect(plain!.textDecorationLine).toBe("none");
    expect(plain!.opacity).toBe("1");
  });

  it("never lets the text grow past what the cover can hold", async () => {
    const screen = await renderCover({ ...cases[1]!, box: 240 });
    const stage = rect(screen, ".page-cover-stage");

    for (const line of pickAll(screen, ".blog-cover-line")) {
      expect(Number.parseFloat(getComputedStyle(line).fontSize)).toBeLessThanOrEqual(
        stage.width * 0.09 + 0.1,
      );
    }
    near(size(screen, ".blog-cover-line"), (240 - 2) * 0.09, 0.2);
  });
});

describe("terminal cover", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("draws the window with the title, the command, the result and the cursor", async () => {
    const screen = await renderCover(cases[3]!);

    expect(pick(screen, ".blog-cover-window-title").textContent).toBe(
      "github.com/[user]/llms-txt-gen",
    );
    expect(pick(screen, ".blog-cover-command").textContent?.replace(/\s+/g, " ").trim()).toBe(
      "$ npx llms-txt-gen init",
    );
    expect(pick(screen, ".blog-cover-output").textContent).toBe("✓ llms.txt generated · 42 pages");
    expect(pickAll(screen, ".blog-cover-dot")).toHaveLength(3);
    near(rect(screen, ".blog-cover-dot").width, 10, 0.1);
    near(rect(screen, ".blog-cover-cursor").width, 10, 0.1);
    near(rect(screen, ".blog-cover-cursor").height, 18, 0.1);
  });

  it("centers the window and stops it at 644 on a wide cover and 459 on a compact one", async () => {
    const wide = await renderCover(cases[3]!);
    const stage = rect(wide, ".page-cover-stage");
    const window = rect(wide, ".blog-cover-window");

    near(window.width, 644);
    near(window.left + window.width / 2, stage.left + stage.width / 2, 0.5);
    near(window.top + window.height / 2, stage.top + stage.height / 2, 0.5);
    wide.unmount();

    const narrow = await renderCover({ ...cases[3]!, viewport: mobile, box: 350 });
    near(rect(narrow, ".blog-cover-window").width, (350 - 2) * 0.84, 1);
    expect(rect(narrow, ".blog-cover-window").width).toBeLessThan(644);
    narrow.unmount();

    const compact = await renderCover({ ...cases[3]!, size: "compact", box: 720 });
    near(rect(compact, ".blog-cover-window").width, 459);
  });

  it("makes the compact window smaller in every part", async () => {
    const screen = await renderCover({ ...cases[3]!, size: "compact" });

    near(rect(screen, ".blog-cover-dot").width, 7, 0.1);
    near(size(screen, ".blog-cover-window-title"), 10, 0.1);
    near(size(screen, ".blog-cover-window-body"), 12, 0.1);
    near(rect(screen, ".blog-cover-cursor").width, 7, 0.1);
    near(rect(screen, ".blog-cover-cursor").height, 13, 0.1);
  });

  it("cuts a long title with an ellipsis instead of widening the window", async () => {
    const screen = await renderCover({
      ...cases[3]!,
      viewport: mobile,
      box: 350,
      cover: {
        type: "terminal",
        title: "github.com/[user]/a-very-long-repository-name-that-does-not-fit",
        command: "npx a-very-long-command --with --many --flags --that --do --not --fit",
        output: "✓ a very long result line that does not fit in the small window",
      },
    });
    const window = rect(screen, ".blog-cover-window");

    for (const selector of [
      ".blog-cover-window-title",
      ".blog-cover-command",
      ".blog-cover-output",
    ]) {
      const box = rect(screen, selector);
      expect(box.right, selector).toBeLessThanOrEqual(window.right + 0.5);
      expect(getComputedStyle(pick(screen, selector)).textOverflow, selector).toBe("ellipsis");
    }
  });

  it.each([
    {
      theme: "torii-synth",
      bg: "rgb(17, 18, 22)",
      prompt: "--color-secondary-ink",
      ok: "rgb(124, 242, 176)",
      radius: 0,
      cut: 8,
      dot: "0px",
    },
    {
      theme: "cyber-sakura",
      bg: "rgb(255, 255, 255)",
      prompt: "rgb(9, 105, 218)",
      ok: "rgb(26, 127, 55)",
      radius: 14,
      cut: 0,
      dot: "50%",
    },
  ])("draws the $theme window", async ({ theme, bg, prompt, ok, radius, cut, dot }) => {
    setTheme(theme);
    const screen = await renderCover(cases[3]!);
    const window = getComputedStyle(pick(screen, ".blog-cover-window"));

    expect(window.backgroundColor).toBe(bg);
    expect(getComputedStyle(pick(screen, ".blog-cover-prompt")).color).toBe(
      prompt.startsWith("--") ? resolveColor(`var(${prompt})`) : prompt,
    );
    expect(getComputedStyle(pick(screen, ".blog-cover-output")).color).toBe(ok);
    near(Number.parseFloat(window.borderTopLeftRadius), radius, 0.2);
    near(Number.parseFloat(window.clipPath.slice(8)), cut, 0.2);
    expect(getComputedStyle(pick(screen, ".blog-cover-dot")).borderTopLeftRadius).toBe(dot);
  });
});

describe("video cover", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("puts the title, the play button and the duration where the layout wants them", async () => {
    const screen = await renderCover(cases[4]!);
    const stage = rect(screen, ".page-cover-stage");
    const play = rect(screen, ".blog-cover-play");
    const duration = rect(screen, ".blog-cover-duration");
    const title = rect(screen, ".blog-cover-video-title");

    near(play.width, 76, 0.2);
    near(play.height, 76, 0.2);
    near(play.left + play.width / 2, stage.left + stage.width / 2, 0.5);
    near(play.top + play.height / 2, stage.top + stage.height / 2, 0.5);
    near(stage.right - duration.right, 12, 0.5);
    near(stage.bottom - duration.bottom, 12, 0.5);
    near(title.left - stage.left, stage.width * 0.07, 0.5);
    near(title.top - stage.top, stage.height * 0.12, 0.5);
    near(size(screen, ".blog-cover-video-title"), 64 * 0.8, 0.3);
    near(size(screen, ".blog-cover-duration"), 12, 0.1);
    expect(pick(screen, ".blog-cover-duration").textContent).toBe("24:18");
    expect(pick(screen, ".blog-cover-video-title").textContent).toBe("<Calendar />");
  });

  it("shrinks the play button in the compact cover", async () => {
    const screen = await renderCover({ ...cases[4]!, size: "compact" });

    near(rect(screen, ".blog-cover-play").width, 56, 0.2);
    near(rect(screen, ".blog-cover-play-icon").width, 20, 0.2);
  });

  it("shifts the triangle to the right so that it looks centered", async () => {
    const screen = await renderCover(cases[4]!);
    const play = rect(screen, ".blog-cover-play");
    const icon = rect(screen, ".blog-cover-play-icon");

    near(icon.left + icon.width / 2 - (play.left + play.width / 2), 5 / 2, 0.5);
  });

  it.each([
    { theme: "torii-synth", radius: "0px", ink: "rgb(9, 9, 12)", cut: 12 },
    { theme: "cyber-sakura", radius: "50%", ink: "rgb(255, 255, 255)", cut: 0 },
  ])("draws the $theme play button", async ({ theme, radius, ink, cut }) => {
    setTheme(theme);
    const screen = await renderCover(cases[4]!);
    const play = getComputedStyle(pick(screen, ".blog-cover-play"));
    const body = getComputedStyle(pick(screen, ".blog-cover-play-body"));

    expect(body.borderTopLeftRadius).toBe(radius);
    near(Number.parseFloat(body.clipPath.slice(8)), cut, 0.2);
    expect(getComputedStyle(pick(screen, ".blog-cover-play-icon")).backgroundColor).toBe(ink);
    expect(body.backgroundImage).toContain("linear-gradient(");
    expect(play.filter).toContain("drop-shadow(");
  });
});

describe("tone", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { tone: "primary" as const, token: "--color-primary" },
    { tone: "secondary" as const, token: "--color-secondary" },
    { tone: "accent" as const, token: "--color-accent" },
  ])("paints the $tone frame with the color of the tone", async ({ tone, token }) => {
    const screen = await renderCover({ ...cases[0]!, tone });
    const from = getComputedStyle(pick(screen, ".blog-cover")).getPropertyValue(
      "--page-cover-from",
    );

    expect(from).toBe(resolveColor(`color-mix(in oklab, var(${token}), white 0%)`));
  });

  it("takes the tone from an ancestor when the prop is not given", async () => {
    await page.viewport(...desktop);
    const screen = await render(() =>
      h("div", { class: "bg-base-100 page-tone page-tone-accent", style: { width: "816px" } }, [
        h(BlogCover, { cover: coverOf("seo-for-llms") }),
      ]),
    );
    const cover = pick(screen, ".blog-cover");

    expect(cover.classList).not.toContain("page-tone");
    expect(getComputedStyle(cover).getPropertyValue("--page-cover-from")).toBe(
      resolveColor("color-mix(in oklab, var(--color-accent), white 0%)"),
    );
  });

  it("lights the frame when the cover is inside a hovered link", async () => {
    const screen = await renderCover(cases[0]!, true);
    const cover = pick(screen, ".blog-cover");
    const idle = getComputedStyle(cover).getPropertyValue("--page-cover-from");

    await userEvent.hover(pick(screen, "a"));
    expect(transitioning(cover, "--page-cover-from")).toBe(true);
    expect(transitioning(cover, "--page-cover-to")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(cover).getPropertyValue("--page-cover-from")).not.toBe(idle);
  });

  it("lets the card light the frame through the lift variable", async () => {
    const screen = await renderCover(cases[0]!);
    const cover = pick<HTMLElement>(screen, ".blog-cover");
    const idle = getComputedStyle(cover).getPropertyValue("--page-cover-from");

    cover.style.setProperty("--page-cover-lift", "40%");
    expect(transitioning(cover, "--page-cover-from")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(cover).getPropertyValue("--page-cover-from")).not.toBe(idle);
  });
});

describe("theme", () => {
  it.each([
    { theme: "torii-synth", radius: 0, cut: 14 },
    { theme: "cyber-sakura", radius: 18, cut: 0 },
  ])("draws the $theme frame", async ({ theme, radius, cut }) => {
    setTheme(theme);
    const screen = await renderCover(cases[0]!);
    const cover = getComputedStyle(pick(screen, ".blog-cover"));

    near(Number.parseFloat(cover.borderTopLeftRadius), radius, 0.2);
    near(Number.parseFloat(cover.clipPath.slice(8)), cut, 0.2);
  });

  it("turns the grid, the glow, the frame and the shapes with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderCover(cases[4]!);
    const stage = pick(screen, ".page-cover-stage");
    const dark = getComputedStyle(stage).backgroundColor;
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    expect(transitioning(stage, "background-color")).toBe(true);
    expect(transitioning(stage, "--page-cover-glow")).toBe(true);
    expect(transitioning(stage, "clip-path")).toBe(true);
    expect(transitioning(pick(screen, ".page-cover-grid"), "--page-cover-grid-line")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover"), "--page-cover-from")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover"), "clip-path")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover"), "border-top-left-radius")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover-play-body"), "--blog-cover-play-from")).toBe(
      true,
    );
    expect(transitioning(pick(screen, ".blog-cover-play-body"), "border-top-left-radius")).toBe(
      true,
    );
    expect(transitioning(pick(screen, ".blog-cover-play"), "filter")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover-duration"), "clip-path")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(stage).backgroundColor).not.toBe(dark);
  });

  it("turns the terminal with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderCover(cases[3]!);
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const window = pick(screen, ".blog-cover-window");
    expect(transitioning(window, "background-color")).toBe(true);
    expect(transitioning(window, "box-shadow")).toBe(true);
    expect(transitioning(window, "clip-path")).toBe(true);
    expect(transitioning(window, "border-top-left-radius")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover-window-head"), "background-color")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover-dot"), "border-top-left-radius")).toBe(true);
    expect(transitioning(pick(screen, ".blog-cover-command"), "color")).toBe(true);
  });

  it("does not transition with reduced motion", async () => {
    await setReducedMotion("reduce");
    setTheme("torii-synth");
    const video = await renderCover(cases[4]!);
    video.container.getBoundingClientRect();
    const tool = await render(() =>
      h(BlogCover, { cover: coverOf("llms-txt-gen"), tone: "secondary" }),
    );
    tool.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const targets = [
      ".blog-cover",
      ".page-cover-stage",
      ".page-cover-grid",
      ".blog-cover-play",
      ".blog-cover-play-body",
      ".blog-cover-duration",
      ".blog-cover-window",
      ".blog-cover-window-head",
      ".blog-cover-dot",
    ].flatMap((selector) => [
      ...video.container.querySelectorAll(selector),
      ...tool.container.querySelectorAll(selector),
    ]);
    expect(targets.length).toBeGreaterThan(6);
    expect(
      document.getAnimations().filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && targets.includes(effect?.target as Element);
      }),
    ).toHaveLength(0);
  });
});
