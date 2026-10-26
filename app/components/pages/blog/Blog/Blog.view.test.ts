import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { $api } from "~/assets/api";
import { Route, type Locale } from "~/assets/const";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import { countBlogKinds } from "~/components/pages/blog/shared/blogCatalog";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import type { BlogKind, BlogPostSummary } from "~/assets/api/types/blog";
import Blog from "./Blog.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));
vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface BlogView {
  width: number;
  height: number;
  locale?: Locale;
}

const TONES: Record<BlogKind, string> = { article: "primary", tool: "secondary", video: "accent" };

let posts: BlogPostSummary[] = [];

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
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

async function renderBlog(
  item: Pick<BlogView, "width" | "height" | "locale">,
  items: BlogPostSummary[] = posts,
  header = true,
) {
  const locale = item.locale ?? "en";
  await page.viewport(item.width, item.height);
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        header ? h(TheHeader) : null,
        h("main", null, h(Blog, { posts: items })),
      ]),
    { global: { plugins: [createApp(locale)] } },
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderBlog>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function chips(screen: Screen) {
  return pickAll<HTMLButtonElement>(screen, ".blog-filter");
}

function chip(screen: Screen, key: "all" | BlogKind) {
  const index = key === "all" ? 0 : kinds().indexOf(key) + 1;
  return chips(screen)[index]!;
}

function cardTitles(screen: Screen) {
  return pickAll(screen, ".blog-card").map((card) => text(card.querySelector(".blog-card-title")));
}

function titlesOf(items: BlogPostSummary[]) {
  return items.map((post) => post.title);
}

function kinds() {
  return countBlogKinds(posts).map(({ kind }) => kind);
}

function pressed(screen: Screen) {
  return chips(screen).map((item) => item.getAttribute("aria-pressed"));
}

function navHrefs(screen: Screen) {
  return pickAll(screen, ".page-sections-nav-link").map((link) => link.getAttribute("href"));
}

function resolve(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
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

async function applyFilter(screen: Screen, key: "all" | BlogKind) {
  await userEvent.click(chip(screen, key));
  await vi.waitFor(() => {
    finishAnimations();
    expect(pickAll(screen, ".blog-list-leave-active")).toHaveLength(0);
  });
}

beforeAll(async () => {
  posts = await $api.blog.fetchPosts();
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Blog. Tips, stories, tools Articles");
  await document.fonts.load('700 1em "Montserrat Alternates"', "Блог. Советы, истории");
  await document.fonts.load('300 1em "Martian Mono"', "05 — BLOG All Articles (3)");
  await document.fonts.load('400 1em "Martian Mono"', "robots.txt llms.txt");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  window.scrollTo({ top: 0, behavior: "instant" });
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe("data", () => {
  it("loads the posts of the catalog from the api", async () => {
    expect(await $api.blog.fetchPosts()).toEqual(posts);
    expect($api.blog.fetchPosts()).toBeInstanceOf(Promise);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("mixes several kinds in the data", () => {
    expect(new Set(posts.map((post) => post.kind)).size).toBeGreaterThan(1);
  });
});

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the heading block of the catalog", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const root = pick(screen, ".blog");

    expect(root.classList.contains("page-sections")).toBe(true);
    expect(root.classList.contains("container")).toBe(true);
    expect(pick(screen, ".blog-header").id).toBe("top");
    expect(text(pick(screen, ".blog-eyebrow"))).toBe(en.blog.eyebrow);
    expect(text(pick(screen, "h1"))).toBe(`${en.blog.title} ${en.blog.titleAccent}`);
    expect(text(pick(screen, ".blog-title-accent"))).toBe(en.blog.titleAccent);
    expect(text(pick(screen, ".blog-lead"))).toBe(en.blog.lead);
    expect(pickAll(screen, "h1")).toHaveLength(1);
  });

  it("renders one flat list of cards in the order of the data without sections", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    expect(cardTitles(screen)).toEqual(titlesOf(posts));
    expect(pickAll(screen, ".blog-cards")).toHaveLength(1);
    expect(pickAll(screen, ".page-section")).toHaveLength(0);
    expect(pickAll(screen, ".blog-section")).toHaveLength(0);
    expect(pickAll(screen, ".blog-section-all")).toHaveLength(0);
    expect(pickAll(screen, ".blog-rule")).toHaveLength(0);
  });

  it("uses h1 for the page and h2 for every card", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    expect(pickAll(screen, ".blog h1")).toHaveLength(1);
    expect(pickAll(screen, ".blog h2")).toHaveLength(posts.length);
    expect(pickAll(screen, ".blog h3")).toHaveLength(0);
    for (const post of posts) {
      expect(pick(screen, `#post-${post.slug}`).tagName).toBe("H2");
    }
  });

  it("gives every card the tone of its kind", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    pickAll(screen, ".blog-card").forEach((card, index) => {
      expect(card.classList.contains(`page-tone-${TONES[posts[index]!.kind]}`)).toBe(true);
    });
  });

  it("links the cover, the title and the button of a card to its post page", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    pickAll(screen, ".blog-card").forEach((card, index) => {
      const href = Route.post(posts[index]!.slug);
      const cover = card.querySelector<HTMLAnchorElement>(".blog-card-cover")!;
      const internal = [...card.querySelectorAll("a")].filter(
        (link) => link.getAttribute("target") !== "_blank",
      );

      expect(cover.getAttribute("aria-hidden")).toBe("true");
      expect(cover.getAttribute("tabindex")).toBe("-1");
      expect(internal.map((link) => link.getAttribute("href"))).toEqual([href, href, href]);
    });
  });

  it("draws the button of a card with the tone of its kind", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    pickAll(screen, ".blog-card").forEach((card, index) => {
      const post = posts[index]!;
      const cta = card.querySelector(".blog-card-cta")!;

      expect(cta.classList.contains("btn-md")).toBe(true);
      expect(cta.classList.contains("btn-block")).toBe(true);
      expect(cta.classList.contains(`btn-${TONES[post.kind]}`)).toBe(true);
      expect(text(cta)).toBe(en.blog.card.cta[post.kind]);
    });
  });

  it("opens the source of a post in a new tab", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    pickAll<HTMLAnchorElement>(screen, ".blog-card .blog-source-link").forEach((link, index) => {
      expect(link.getAttribute("href")).toBe(posts[index]!.source.url);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });

  it("shows the date of a post and the version of a tool in the meta row", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    pickAll(screen, ".blog-card").forEach((card, index) => {
      const post = posts[index]!;
      const expected = post.kind === "tool" ? post.version : post.publishedAt;
      expect(text(card.querySelector(".blog-card-date"))).toBe(expected);
    });
  });

  it("marks the title of a tool as English and leaves the other titles alone", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".blog-card");

    cards.forEach((card, index) => {
      const name = card.querySelector(".blog-card-name");
      if (posts[index]!.kind === "tool") {
        expect(name?.getAttribute("lang")).toBe("en");
        expect(name?.hasAttribute("data-atom-skip")).toBe(true);
      } else {
        expect(name).toBeNull();
      }
    });
  });
});

describe("filters", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the chips as toggle buttons in a labelled group", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const group = pick(screen, ".blog-filters");

    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe(en.blog.filters.nav);
    expect(pickAll(screen, ".blog-filters a")).toHaveLength(0);
    for (const item of chips(screen)) {
      expect(item.tagName).toBe("BUTTON");
      expect(item.getAttribute("type")).toBe("button");
    }
  });

  it("labels the chips and counts the posts of every kind", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    expect(chips(screen).map((item) => text(item))).toEqual([
      `${en.blog.filters.all} ${posts.length}`,
      ...kinds().map(
        (kind) => `${en.blog.filters[kind]} ${posts.filter((post) => post.kind === kind).length}`,
      ),
    ]);
  });

  it("starts with All pressed and nothing else", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    expect(pressed(screen)).toEqual(["true", ...kinds().map(() => "false")]);
    expect(cardTitles(screen)).toEqual(titlesOf(posts));
  });

  it.each(["article", "tool", "video"] as BlogKind[])(
    "shows only the posts of the kind %s and presses its chip",
    async (kind) => {
      const screen = await renderBlog({ width: 1440, height: 900 });
      await applyFilter(screen, kind);

      expect(cardTitles(screen)).toEqual(titlesOf(posts.filter((post) => post.kind === kind)));
      expect(pressed(screen)).toEqual(
        ["all", ...kinds()].map((key) => (key === kind ? "true" : "false")),
      );
    },
  );

  it("keeps the counters and returns every post with All", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const before = chips(screen).map((item) => text(item));

    await applyFilter(screen, "tool");
    expect(chips(screen).map((item) => text(item))).toEqual(before);

    await applyFilter(screen, "all");
    expect(cardTitles(screen)).toEqual(titlesOf(posts));
    expect(pressed(screen)[0]).toBe("true");
  });

  it("switches the filter with the keyboard", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, kinds()[0]!);

    target.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => {
      finishAnimations();
      expect(target.getAttribute("aria-pressed")).toBe("true");
    });
    expect(pressed(screen)[0]).toBe("false");
  });

  it("does not show a chip for a kind without posts", async () => {
    const articles = posts.filter((post) => post.kind === "article");
    const screen = await renderBlog({ width: 1440, height: 900 }, articles, false);

    expect(chips(screen).map((item) => text(item))).toEqual([
      `${en.blog.filters.all} ${articles.length}`,
      `${en.blog.filters.article} ${articles.length}`,
    ]);
    expect(pickAll(screen, ".blog-card")).toHaveLength(articles.length);
  });

  it("fades the cards that the filter removes", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const leaving = pickAll<HTMLElement>(screen, ".blog-card").filter(
      (card, index) => posts[index]!.kind !== kinds()[0],
    );

    await userEvent.click(chip(screen, kinds()[0]!));

    expect(leaving.length).toBeGreaterThan(0);
    expect(leaving.some((card) => transitioning(card, "opacity"))).toBe(true);
    await vi.waitFor(() => {
      finishAnimations();
      expect(cardTitles(screen)).toHaveLength(
        posts.filter((post) => post.kind === kinds()[0]).length,
      );
    });
  });

  it("fades in the cards that the filter brings back", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    await applyFilter(screen, kinds()[0]!);

    await userEvent.click(chip(screen, "all"));
    const entering = pickAll<HTMLElement>(screen, ".blog-card").filter((card) =>
      transitioning(card, "opacity"),
    );

    expect(entering.length).toBeGreaterThan(0);
    finishAnimations();
  });

  it("changes the cards at once with reduced motion", async () => {
    await setReducedMotion("reduce");
    const screen = await renderBlog({ width: 1440, height: 900 });

    await userEvent.click(chip(screen, kinds()[0]!));
    await nextTick();

    expect(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .filter((animation) => (animation as CSSTransition).transitionProperty === "opacity"),
    ).toHaveLength(0);
    await vi.waitFor(() => {
      expect(cardTitles(screen)).toEqual(
        titlesOf(posts.filter((post) => post.kind === kinds()[0])),
      );
    });
  });

  it("repaints the pressed chip with a transition", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, kinds()[0]!);
    const old = chip(screen, "all");

    await userEvent.click(target);

    expect(transitioning(target, "background-color", "::before")).toBe(true);
    expect(transitioning(old, "background-color", "::before")).toBe(true);
    expect(transitioning(target, "color")).toBe(true);
    finishAnimations();
  });
});

describe("navigation", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("builds the panel as a flat list with one item per card", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    expect(text(pick(screen, ".page-sections-nav-title"))).toBe(en.blog.nav.title);
    expect(navHrefs(screen)).toEqual(posts.map((post) => Route.anchor(`post-${post.slug}`)));
    expect(pickAll(screen, ".page-sections-nav-link").map((link) => text(link))).toEqual(
      titlesOf(posts),
    );
    expect(pickAll(screen, ".page-sections-nav-list .page-sections-nav-list")).toHaveLength(0);
  });

  it("follows the filter and drops the removed cards from the panel", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const kind = kinds()[1] ?? kinds()[0]!;
    await applyFilter(screen, kind);

    await vi.waitFor(() => {
      expect(navHrefs(screen)).toEqual(
        posts.filter((post) => post.kind === kind).map((post) => Route.anchor(`post-${post.slug}`)),
      );
    });

    await applyFilter(screen, "all");
    await vi.waitFor(() => {
      expect(navHrefs(screen)).toEqual(posts.map((post) => Route.anchor(`post-${post.slug}`)));
    });
  });

  it("shows the side panel on the desktop", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const nav = pick(screen, ".page-sections-nav");
    const content = pick(screen, ".page-sections-content");

    expect(nav.getBoundingClientRect().left).toBeGreaterThan(content.getBoundingClientRect().right);
    expect(getComputedStyle(nav).position).toBe("sticky");
  });

  it.each([
    { name: "tablet", width: 768, height: 900 },
    { name: "mobile", width: 390, height: 780 },
  ])("turns the panel into a collapsible plate on the $name", async (item) => {
    const screen = await renderBlog(item);
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");

    expect(head.tagName).toBe("BUTTON");
    expect(head.getAttribute("aria-expanded")).toBe("false");
    expect(text(pick(screen, ".page-sections-nav-summary"))).toContain(`${posts.length} posts`);

    await userEvent.click(head);
    expect(head.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(head);
    expect(head.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("layout", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { name: "desktop", width: 1440, height: 900, title: 64, card: 28, cover: 400, gap: 56 },
    { name: "tablet", width: 768, height: 900, title: 52, card: 26, cover: 360, gap: 48 },
    { name: "mobile", width: 390, height: 780, title: 38, card: 20, cover: 196, gap: 40 },
  ])("sizes the text, the cover and the gap on the $name", async (item) => {
    const screen = await renderBlog(item);
    const size = (selector: string) =>
      Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
    const cards = pickAll(screen, ".blog-card");
    const gap = cards[1]!.getBoundingClientRect().top - cards[0]!.getBoundingClientRect().bottom;

    expect(Math.abs(size(".blog-title") - item.title)).toBeLessThanOrEqual(1);
    expect(Math.abs(size(".blog-card-title") - item.card)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(pick(screen, ".blog-cover").getBoundingClientRect().height - item.cover),
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(gap - item.gap)).toBeLessThanOrEqual(1);
  });

  it("stacks the cards in one column", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const cards = pickAll(screen, ".blog-card").slice(0, 2);

    expect(cards[0]!.getBoundingClientRect().left).toBe(cards[1]!.getBoundingClientRect().left);
    expect(cards[1]!.getBoundingClientRect().top).toBeGreaterThan(
      cards[0]!.getBoundingClientRect().bottom,
    );
  });

  it("limits the width of the content with the container", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });

    expect(pick(screen, ".blog").classList.contains("container")).toBe(true);
    expect(pick(screen, ".blog").getBoundingClientRect().width).toBeLessThanOrEqual(1240);
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 768, height: 900, locale: "en" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
  ])("keeps everything inside the screen at $width in $locale", async (item) => {
    const screen = await renderBlog(item);
    const root = pick(screen, ".blog").getBoundingClientRect();
    const header = pick(screen, ".blog-header").getBoundingClientRect();
    const filters = pick(screen, ".blog-filters").getBoundingClientRect();
    const cards = pick(screen, ".blog-cards").getBoundingClientRect();

    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
    for (const selector of [
      ".blog-header",
      ".blog-filter",
      ".blog-card",
      ".blog-cover",
      ".page-sections-nav",
    ]) {
      for (const element of screen.container.querySelectorAll(selector)) {
        const box = element.getBoundingClientRect();
        expect(box.left, selector).toBeGreaterThanOrEqual(root.left - 0.5);
        expect(box.right, selector).toBeLessThanOrEqual(root.right + 0.5);
      }
    }
    expect(filters.top).toBeGreaterThanOrEqual(header.bottom - 0.5);
    expect(cards.top).toBeGreaterThanOrEqual(filters.bottom - 0.5);
  });
});

describe("states", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("highlights the border of an idle chip and its text on hover", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, kinds()[0]!);
    const before = getComputedStyle(target, "::before").borderTopColor;
    const ink = getComputedStyle(target).color;

    await userEvent.hover(target);
    expect(transitioning(target, "color")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(target, "::before").borderTopColor).not.toBe(before);
    expect(getComputedStyle(target).color).not.toBe(ink);
    expect(getComputedStyle(target).color).toBe(resolve("--color-base-content"));
  });

  it("fills and outlines the pressed chip", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const current = chip(screen, "all");
    const other = chip(screen, kinds()[0]!);

    expect(getComputedStyle(current, "::before").backgroundColor).not.toBe(
      getComputedStyle(other, "::before").backgroundColor,
    );
    expect(getComputedStyle(current).color).toBe(resolve("--color-base-content"));
  });

  it("draws the focus ring of a chip with the brand color", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, "all");

    target.focus();
    await userEvent.keyboard("{Tab}");
    finishAnimations();

    expect(document.activeElement).toBe(chip(screen, kinds()[0]!));
    expect(getComputedStyle(chip(screen, kinds()[0]!)).outlineColor).toBe(resolve("--color-brand"));
  });

  it("tints the title of a card with its tone and lifts the cover on hover", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 });
    const card = pick<HTMLElement>(screen, ".blog-card");
    const title = card.querySelector<HTMLElement>(".blog-card-title")!;
    const cover = card.querySelector<HTMLElement>(".blog-cover")!;

    expect(getComputedStyle(title).color).toBe(resolve("--color-base-content"));
    expect(getComputedStyle(cover).getPropertyValue("--page-cover-lift").trim()).toBe("0%");

    await userEvent.hover(card.querySelector(".blog-card-excerpt")!);
    expect(transitioning(title, "color")).toBe(true);
    expect(transitioning(cover, "--page-cover-from")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(title).color).toBe(resolve("--color-primary-ink"));
    expect(getComputedStyle(cover).getPropertyValue("--page-cover-lift").trim()).toBe("30%");
  });

  it("does not animate the hover with reduced motion", async () => {
    await setReducedMotion("reduce");
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, kinds()[0]!);
    const title = pick<HTMLElement>(screen, ".blog-card-title");

    await userEvent.hover(target);
    await userEvent.hover(title);

    expect(transitioning(target, "color")).toBe(false);
    expect(transitioning(title, "color")).toBe(false);
    expect(getComputedStyle(title).color).toBe(resolve("--color-primary-ink"));
  });

  it("transitions the shape of the chip between the themes", async () => {
    setTheme("torii-synth");
    const screen = await renderBlog({ width: 1440, height: 900 });
    const target = chip(screen, kinds()[0]!);
    setTheme("cyber-sakura");

    expect(transitioning(target, "clip-path", "::before")).toBe(true);
    expect(transitioning(target, "border-top-left-radius", "::before")).toBe(true);
  });

  it("transitions the gradient and the shape of a cover between the themes", async () => {
    setTheme("torii-synth");
    const screen = await renderBlog({ width: 1440, height: 900 });
    const cover = pick<HTMLElement>(screen, ".blog-cover");
    setTheme("cyber-sakura");

    expect(transitioning(cover, "--page-cover-from")).toBe(true);
    expect(transitioning(cover, "clip-path")).toBe(true);
  });
});

describe("languages", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the catalog in Russian", async () => {
    const screen = await renderBlog({ width: 1440, height: 900, locale: "ru" });

    expect(text(pick(screen, ".blog-eyebrow"))).toBe(ru.blog.eyebrow);
    expect(text(pick(screen, "h1"))).toBe(`${ru.blog.title} ${ru.blog.titleAccent}`);
    expect(text(chips(screen)[0])).toBe(`${ru.blog.filters.all} ${posts.length}`);
    expect(pick(screen, ".blog-filters").getAttribute("aria-label")).toBe(ru.blog.filters.nav);
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe(ru.blog.nav.title);
  });
});

describe("empty state", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("shows the empty text and no filters or cards without posts", async () => {
    const screen = await renderBlog({ width: 1440, height: 900 }, [], false);

    expect(text(pick(screen, ".blog-empty"))).toBe(en.blog.empty);
    expect(pickAll(screen, ".blog-filter")).toHaveLength(0);
    expect(pickAll(screen, ".blog-card")).toHaveLength(0);
    expect(pick(screen, ".blog-header")).not.toBeNull();
    expect(getComputedStyle(pick(screen, ".page-sections-aside")).display).toBe("none");
  });
});

describe("server", () => {
  it("renders the whole catalog and its navigation on the server", async () => {
    const app = createSSRApp({ render: () => h(Blog, { posts }) });
    app.use(createApp("en"));
    const root = document.createElement("div");
    root.innerHTML = await renderToString(app);

    expect(text(root.querySelector("h1"))).toBe(`${en.blog.title} ${en.blog.titleAccent}`);
    expect(root.querySelectorAll(".blog-card")).toHaveLength(posts.length);
    expect([...root.querySelectorAll(".blog-card-title")].map((title) => text(title))).toEqual(
      titlesOf(posts),
    );
    expect(
      [...root.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual(posts.map((post) => Route.anchor(`post-${post.slug}`)));
    expect(root.querySelector(".blog-card-link")?.getAttribute("href")).toBe(
      Route.post(posts[0]!.slug),
    );
    expect(
      [...root.querySelectorAll(".blog-filter")].map((item) => item.getAttribute("aria-pressed")),
    ).toEqual(["true", ...kinds().map(() => "false")]);
    expect(root.querySelector(".blog-header")?.id).toBe("top");
  });

  it("renders the empty state on the server", async () => {
    const app = createSSRApp({ render: () => h(Blog, { posts: [] }) });
    app.use(createApp("en"));
    const root = document.createElement("div");
    root.innerHTML = await renderToString(app);

    expect(text(root.querySelector(".blog-empty"))).toBe(en.blog.empty);
    expect(root.querySelectorAll(".blog-card")).toHaveLength(0);
  });
});
