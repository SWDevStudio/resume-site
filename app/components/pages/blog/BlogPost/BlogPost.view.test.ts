import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, type Locale } from "~/assets/const";
import { $api } from "~/assets/api";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import type {
  BlogBlock,
  BlogKind,
  BlogPostChapterData,
  BlogPostCoverData,
  BlogPostFactsData,
  BlogPostHeaderData,
  BlogPostRelatedData,
  BlogPostSourceData,
  BlogPostTagsData,
} from "~/assets/api/types/blog";
import BlogPost from "./BlogPost.vue";
import { blogPostBlockNames } from "./blogPostBlocks";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));
vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface PostView {
  name: string;
  width: number;
  height: number;
  kind: BlogKind;
  locale?: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const KINDS: {
  kind: BlogKind;
  tone: string;
}[] = [
  { kind: "article", tone: "primary" },
  { kind: "tool", tone: "secondary" },
  { kind: "video", tone: "accent" },
];

const cases: PostView[] = [
  { name: "article-desktop", width: 1440, height: 900, kind: "article" },
  { name: "article-tablet", width: 768, height: 900, kind: "article" },
  { name: "article-mobile", width: 390, height: 780, kind: "article" },
  { name: "tool-desktop", width: 1440, height: 900, kind: "tool" },
  { name: "video-desktop", width: 1440, height: 900, kind: "video" },
  { name: "article-desktop-ru", width: 1440, height: 900, kind: "article", locale: "ru" },
];

const switchCases: PostView[] = [
  { name: "article-desktop", width: 1440, height: 900, kind: "article" },
  { name: "article-mobile", width: 390, height: 780, kind: "article" },
  { name: "tool-desktop", width: 1440, height: 900, kind: "tool" },
  { name: "video-desktop", width: 1440, height: 900, kind: "video" },
];

const posts = await $api.blog.fetchPosts();

async function loadPost(kind: BlogKind) {
  const summary = posts.find((post) => post.kind === kind)!;
  const blocks = (await $api.blog.fetchPost(summary.slug))!;
  return { slug: summary.slug, summary, blocks };
}

function blockData<T>(blocks: BlogBlock[], component: string) {
  return blocks.find((block) => block.component === component)?.data as T | undefined;
}

function chaptersOf(
  blocks: BlogBlock[],
  depth = 0,
): {
  data: BlogPostChapterData;
  depth: number;
}[] {
  return blocks
    .filter((block) => block.component === "BlogPostChapter")
    .flatMap((block) => {
      const data = block.data as unknown as BlogPostChapterData;
      return [{ data, depth }, ...chaptersOf(data.blocks, depth + 1)];
    });
}

function walk(blocks: BlogBlock[]): BlogBlock[] {
  return blocks.flatMap((block) => [
    block,
    ...(block.component === "BlogPostChapter"
      ? walk((block.data as unknown as BlogPostChapterData).blocks)
      : []),
  ]);
}

const loaded = {
  article: await loadPost("article"),
  tool: await loadPost("tool"),
  video: await loadPost("video"),
};

interface PostData {
  slug: string;
  blocks: BlogBlock[];
  header: BlogPostHeaderData;
  cover: BlogPostCoverData;
  source: BlogPostSourceData;
  facts: BlogPostFactsData | undefined;
  tags: BlogPostTagsData;
  related: BlogPostRelatedData;
  chapters: ReturnType<typeof chaptersOf>;
}

const views = Object.fromEntries(
  KINDS.map(({ kind }): [BlogKind, PostData] => {
    const { slug, blocks } = loaded[kind];
    return [
      kind,
      {
        slug,
        blocks,
        header: blockData<BlogPostHeaderData>(blocks, "BlogPostHeader")!,
        cover: blockData<BlogPostCoverData>(blocks, "BlogPostCover")!,
        source: blockData<BlogPostSourceData>(blocks, "BlogPostSource")!,
        facts: blockData<BlogPostFactsData>(blocks, "BlogPostFacts"),
        tags: blockData<BlogPostTagsData>(blocks, "BlogPostTags")!,
        related: blockData<BlogPostRelatedData>(blocks, "BlogPostRelated")!,
        chapters: chaptersOf(blocks),
      },
    ];
  }),
) as Record<BlogKind, PostData>;

const article = views.article;

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

async function renderBlocks(
  blocks: BlogBlock[],
  item: Pick<PostView, "width" | "height"> = { width: 1440, height: 900 },
  locale: Locale = "en",
  header = true,
) {
  await page.viewport(item.width, item.height);
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        header ? h(TheHeader) : null,
        h("main", null, h(BlogPost, { blocks })),
      ]),
    { global: { plugins: [createApp(locale)] } },
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

function renderPost(item: Pick<PostView, "width" | "height" | "kind" | "locale">, header = true) {
  return renderBlocks(views[item.kind].blocks, item, item.locale ?? "en", header);
}

type Screen = Awaited<ReturnType<typeof renderBlocks>>;

async function fit(screen: Screen, width: number) {
  await page.viewport(width, Math.ceil(document.documentElement.scrollHeight));
  screen.container.getBoundingClientRect();
}

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function rect(screen: Screen, selector: string) {
  return pick(screen, selector).getBoundingClientRect();
}

function size(screen: Screen, selector: string) {
  return Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
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

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "SEO for LLMs On this page Read more");
  await document.fonts.load('400 1em "Montserrat Alternates"', "На этой странице");
  await document.fonts.load('300 1em "Martian Mono"', "People increasingly ask AI 01 ARTICLE");
  await document.fonts.load('400 1em "Martian Mono"', "robots.txt llms.txt --sitemap");
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

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderPost(item);
    await fit(screen, item.width);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderPost(item);
    await fit(screen, item.width);
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

describe("data", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("loads the blocks of every catalog post from the api by its slug", async () => {
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      const blocks = await $api.blog.fetchPost(post.slug);
      expect(Array.isArray(blocks), post.slug).toBe(true);
      expect(blockData<BlogPostHeaderData>(blocks!, "BlogPostHeader")?.slug, post.slug).toBe(
        post.slug,
      );
    }
    expect($api.blog.fetchPost(article.slug)).toBeInstanceOf(Promise);
  });

  it.each(["unknown", "", "../posts", `${article.slug}.json`, article.slug.toUpperCase()])(
    "returns null for the unknown slug %j",
    async (slug) => {
      expect(await $api.blog.fetchPost(slug)).toBeNull();
    },
  );

  it("stores every post as a list of known component and data pairs", () => {
    for (const kind of KINDS) {
      const { blocks } = views[kind.kind];
      for (const block of walk(blocks)) {
        expect(Object.keys(block).sort()).toEqual(["component", "data"]);
        expect(blogPostBlockNames).toContain(block.component);
      }
    }
  });

  it("starts every post with the hidden intro chapter and ends it with tags and related", () => {
    for (const kind of KINDS) {
      const { blocks, chapters } = views[kind.kind];
      expect(chapters[0]!.data.id).toBe("intro");
      expect(chapters[0]!.data.hidden).toBe(true);
      expect(blocks.at(-2)!.component).toBe("BlogPostTags");
      expect(blocks.at(-1)!.component).toBe("BlogPostRelated");
    }
  });

  it("skips a block of an unknown component and keeps the rest", async () => {
    const blocks: BlogBlock[] = [
      { component: "Unknown", data: {} },
      article.blocks[0]!,
      { component: "BlogPostText", data: { text: "Loose paragraph" } },
    ];
    const screen = await renderBlocks(blocks, { width: 1440, height: 900 }, "en", false);

    expect(pickAll(screen, "h1")).toHaveLength(1);
    expect(pickAll(screen, ".blog-post-text").map((item) => text(item))).toEqual([
      "Loose paragraph",
    ]);
  });

  it("builds the page from any order and nesting of the blocks", async () => {
    const blocks: BlogBlock[] = [
      { component: "BlogPostText", data: { text: "Intro" } },
      {
        component: "BlogPostChapter",
        data: {
          id: "first",
          name: "First",
          blocks: [
            {
              component: "BlogPostChapter",
              data: {
                id: "inner",
                name: "Inner",
                blocks: [{ component: "BlogPostText", data: { text: "Deep" } }],
              },
            },
          ],
        },
      },
      { component: "BlogPostText", data: { text: "Middle" } },
      { component: "BlogPostChapter", data: { id: "second", name: "Second", blocks: [] } },
    ];
    const screen = await renderBlocks(blocks, { width: 1440, height: 900 }, "en", false);

    expect(
      pickAll(screen, ".page-section-heading").map((item) => `${item.tagName} ${text(item)}`),
    ).toEqual(["H2 First", "H3 Inner", "H2 Second"]);
    expect(pickAll(screen, ".blog-post-chapters")).toHaveLength(2);
    expect(pickAll(screen, ".page-sections-nav-link").map((item) => text(item))).toEqual([
      "First",
      "Inner",
      "Second",
    ]);
  });

  it("renders every block of the registry", async () => {
    const blocks: BlogBlock[] = [
      article.blocks[0]!,
      article.blocks[1]!,
      { component: "BlogPostFacts", data: { ...views.tool.facts } },
      article.blocks[2]!,
      {
        component: "BlogPostChapter",
        data: {
          id: "all",
          name: "All",
          blocks: [
            { component: "BlogPostText", data: { text: "Paragraph" } },
            { component: "BlogPostList", data: { ordered: true, items: ["One", "Two"] } },
            { component: "BlogPostList", data: { ordered: false, items: ["Dot"] } },
            { component: "BlogPostCode", data: { code: "const a = 1;", language: "ts" } },
            { component: "BlogPostCallout", data: { variant: "tip", text: "Tip text" } },
            { component: "BlogPostCallout", data: { variant: "note", text: "Note text" } },
            { component: "BlogPostCallout", data: { variant: "warning", text: "Warning text" } },
            {
              component: "BlogPostTable",
              data: { columns: ["A", "B"], rows: [["a1", "b1"]] },
            },
          ],
        },
      },
      { component: "BlogPostTags", data: { tags: ["One", "Two"] } },
      { component: "BlogPostRelated", data: { items: article.related.items } },
    ];
    const screen = await renderBlocks(blocks, { width: 1440, height: 900 }, "en", false);

    expect(pickAll(screen, ".blog-post-header")).toHaveLength(1);
    expect(pickAll(screen, ".blog-post-cover")).toHaveLength(1);
    expect(pickAll(screen, ".blog-post-facts")).toHaveLength(1);
    expect(pickAll(screen, ".blog-post-source")).toHaveLength(1);
    expect(pickAll(screen, "ol.blog-post-list")).toHaveLength(1);
    expect(pickAll(screen, "ul.blog-post-list")).toHaveLength(1);
    expect(text(pick(screen, ".blog-post-code-body"))).toBe("const a = 1;");
    expect(pickAll(screen, ".blog-post-callout").map((item) => text(item))).toEqual([
      "Tip Tip text",
      "Note Note text",
      "Warning Warning text",
    ]);
    expect(pickAll(screen, ".blog-post-table-head").map((item) => text(item))).toEqual(["A", "B"]);
    expect(pickAll(screen, ".blog-post-table-cell").map((item) => text(item))).toEqual([
      "a1",
      "b1",
    ]);
    expect(pickAll(screen, ".blog-post-tags-item").map((item) => text(item))).toEqual([
      "One",
      "Two",
    ]);
    expect(pickAll(screen, ".blog-post-related-item")).toHaveLength(article.related.items.length);
  });
});

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each(KINDS)("renders the $kind post from the api", async ({ kind, tone }) => {
    const view = views[kind];
    const screen = await renderPost({ width: 1440, height: 900, kind });
    const root = pick(screen, ".blog-post");

    expect(root.classList.contains("page-sections")).toBe(true);
    expect(root.classList.contains("container")).toBe(true);
    expect(root.classList.contains(`page-tone-${tone}`)).toBe(true);
    expect(pickAll(screen, "h1")).toHaveLength(1);
    expect(text(pick(screen, "h1"))).toBe(view.header.title);
    expect(pick(screen, "h1").hasAttribute("id")).toBe(false);
    expect(text(pick(screen, ".blog-post-author-name"))).toBe(view.header.author.name);
    expect(text(pick(screen, ".blog-post-author-role"))).toBe(view.header.author.role);
    expect(pick(screen, ".blog-post-author-role").getAttribute("lang")).toBe("en");
    expect(text(pick(screen, ".blog-post-avatar"))).toBe(view.header.author.initials);
    expect(pickAll(screen, ".blog-post-tags-item").map((item) => text(item))).toEqual(
      view.tags.tags,
    );
    expect(pickAll(screen, ".blog-post-facts")).toHaveLength(kind === "tool" ? 1 : 0);
    expect(getComputedStyle(pick(screen, ".blog-post-label")).color).toBe(
      resolve(`--color-${tone}-ink`),
    );
    expect(getComputedStyle(pick(screen, ".blog-post-label")).textTransform).toBe("uppercase");
    expect(text(pick(screen, ".blog-post-label"))).toContain(view.header.publishedAt);
  });

  it("shows the reading time of an article and the facts of a tool in the eyebrow", async () => {
    const articleScreen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const header = article.header as Extract<BlogPostHeaderData, { kind: "article" }>;
    expect(text(pick(articleScreen, ".blog-post-label"))).toContain(
      `${header.readMinutes} min read`,
    );
    articleScreen.unmount();

    const toolScreen = await renderPost({ width: 1440, height: 900, kind: "tool" });
    const tool = views.tool.header as Extract<BlogPostHeaderData, { kind: "tool" }>;
    const label = text(pick(toolScreen, ".blog-post-label"))!;
    expect(label).toContain(tool.stars);
    expect(label).toContain(tool.language);
    expect(label).toContain(tool.version);
    expect(label).not.toContain(tool.publishedAt);
    toolScreen.unmount();

    const videoScreen = await renderPost({ width: 1440, height: 900, kind: "video" });
    const video = views.video.header as Extract<BlogPostHeaderData, { kind: "video" }>;
    expect(text(pick(videoScreen, ".blog-post-label"))).toContain(video.duration);
  });

  it("shows the five facts of a tool", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "tool" });
    const facts = views.tool.facts!;

    expect(pickAll(screen, ".blog-post-facts-item").map((item) => text(item))).toEqual([
      `★ ${facts.stars} stars`,
      `${facts.forks} forks`,
      facts.language,
      facts.license,
      facts.version,
    ]);
    expect(pickAll(screen, ".blog-post-facts-item [lang='en']").map((item) => text(item))).toEqual([
      facts.language,
      facts.license,
    ]);
  });

  it("makes the first chapter a hidden heading with the intro anchor", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const [intro] = pickAll(screen, ".page-section-heading");

    expect(intro!.tagName).toBe("H2");
    expect(intro!.id).toBe("intro");
    expect(text(intro)).toBe(article.chapters[0]!.data.name);
    expect(intro!.classList.contains("page-section-heading-hidden")).toBe(true);
    const box = intro!.getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);
    expect(pickAll(screen, ".page-section-heading-hidden")).toHaveLength(1);
  });

  it.each(KINDS)("lists the chapters of the $kind post in the navigation", async ({ kind }) => {
    const view = views[kind];
    const screen = await renderPost({ width: 1440, height: 900, kind });
    const anchors = pickAll<HTMLAnchorElement>(screen, ".page-sections-nav-link");

    expect(anchors.map((link) => text(link))).toEqual(
      view.chapters.map((chapter) => chapter.data.name),
    );
    expect(anchors.map((link) => link.getAttribute("href"))).toEqual(
      view.chapters.map((chapter) => Route.anchor(chapter.data.id)),
    );
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
    expect(
      pickAll(screen, ".page-section-heading").map((heading) => `${heading.tagName} ${heading.id}`),
    ).toEqual(view.chapters.map((chapter) => `H${2 + chapter.depth} ${chapter.data.id}`));
  });

  it("links back to the blog and to the source of the post", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const back = pick<HTMLAnchorElement>(screen, ".blog-post-back");
    const source = pick<HTMLAnchorElement>(screen, ".blog-source-link");

    expect(back.getAttribute("href")).toBe(Route.blog);
    expect(text(back)).toBe("Blog");
    expect(source.getAttribute("href")).toBe(article.source.source.url);
    expect(source.target).toBe("_blank");
    expect(source.rel).toBe("noopener noreferrer");
    expect(text(source)).toBe(article.source.source.name);
    expect(text(pick(screen, ".blog-post-source-text"))).toBe(en.blog.post.source.article);
  });

  it.each(KINDS)("uses the source phrase of the $kind post", async ({ kind }) => {
    const screen = await renderPost({ width: 1440, height: 900, kind });

    expect(text(pick(screen, ".blog-post-source-text"))).toBe(en.blog.post.source[kind]);
    expect(text(pick(screen, ".blog-source-link"))).toBe(views[kind].source.source.name);
  });

  it("links the related posts to their pages", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const links = pickAll<HTMLAnchorElement>(screen, ".blog-post-related-link");

    expect(text(pick(screen, ".blog-post-related-title"))).toBe("Read more");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      article.related.items.map((item) => Route.post(item.slug)),
    );
    expect(pickAll(screen, ".blog-post-related-name").map((item) => text(item))).toEqual(
      article.related.items.map((item) => item.title),
    );
    expect(pickAll(screen, ".blog-post-related .blog-cover")).toHaveLength(links.length);
    expect(pickAll(screen, ".blog-post-related h2")).toHaveLength(1);
    expect(
      pickAll(screen, ".blog-post-related-link").map((link) =>
        link.classList.contains(`page-tone-${tonesByKind(article.related.items[0]!.kind)}`),
      )[0],
    ).toBe(true);
  });

  it("wraps the cover of a video in a link to its source and leaves other covers plain", async () => {
    const videoScreen = await renderPost({ width: 1440, height: 900, kind: "video" });
    const link = pick<HTMLAnchorElement>(videoScreen, "a.blog-post-cover");

    expect(link.getAttribute("href")).toBe(views.video.source.source.url);
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
    expect(text(link)).toBe(`Watch on ${views.video.source.source.name}`);
    expect(link.querySelector(".blog-cover")).not.toBeNull();
    videoScreen.unmount();

    for (const kind of ["article", "tool"] as const) {
      const screen = await renderPost({ width: 1440, height: 900, kind });
      expect(pickAll(screen, "a.blog-post-cover")).toHaveLength(0);
      expect(pickAll(screen, ".blog-post-cover.blog-cover")).toHaveLength(1);
      screen.unmount();
    }
  });

  it("keeps the interface strings in the site language and the post data as is", async () => {
    const screen = await renderPost(
      { width: 1440, height: 900, kind: "article", locale: "ru" },
      true,
    );

    expect(text(pick(screen, ".page-sections-nav-title"))).toBe(ru.blog.post.nav);
    expect(text(pick(screen, ".blog-post-back"))).toBe(ru.blog.post.back);
    expect(text(pick(screen, ".blog-post-source-text"))).toBe(ru.blog.post.source.article);
    expect(text(pick(screen, ".blog-post-related-title"))).toBe(ru.blog.post.related);
    expect(text(pick(screen, "h1"))).toBe(article.header.title);
  });

  it("renders the whole post and its navigation on the server", async () => {
    const app = createSSRApp({ render: () => h(BlogPost, { blocks: article.blocks }) });
    app.use(createApp("en"));
    const root = document.createElement("div");
    root.innerHTML = await renderToString(app);

    expect(root.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      article.header.title,
    );
    expect(
      [...root.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual(article.chapters.map((chapter) => `#${chapter.data.id}`));
    expect(root.querySelectorAll("h1")).toHaveLength(1);
    expect(root.querySelectorAll(".blog-post-related-link")).toHaveLength(
      article.related.items.length,
    );
    expect(root.querySelector(".blog-post-back")?.getAttribute("href")).toBe(Route.blog);
  });

  it("counts the sections in the mobile pill", async () => {
    const screen = await renderPost({ width: 390, height: 780, kind: "article" });

    expect(text(pick(screen, ".page-sections-nav-summary"))).toBe(
      `${article.chapters[0]!.data.name} · ${article.chapters.length} sections`,
    );
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
  });
});

function tonesByKind(kind: BlogKind) {
  return KINDS.find((item) => item.kind === kind)!.tone;
}

describe("layout like the mockup", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("lays out the desktop article in two columns", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const header = rect(screen, "header").height;
    const content = rect(screen, ".page-sections-content");
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".blog-post-cover");

    near(content.left, 140);
    near(content.width, 784);
    near(nav.left, 1020);
    near(nav.width, 280);
    near(nav.top, header + 72);
    near(rect(screen, ".blog-post-back").top, header + 24);
    near(rect(screen, ".blog-post-back").height, 44);
    near(cover.width, 784);
    near(cover.height, 400);
    near(size(screen, ".blog-post-title"), 46);
    near(
      size(screen, ".page-section-root > .page-section-heading:not(.page-section-heading-hidden)"),
      28,
    );
    near(size(screen, ".blog-post-text"), 16);
    near(size(screen, ".blog-post-related-title"), 28);
    near(size(screen, ".blog-post-related-name"), 18);
    near(rect(screen, ".blog-post-avatar").width, 40);
    near(rect(screen, ".blog-post-avatar").height, 40);
    near(cover.top - rect(screen, ".blog-post-header").bottom, 28);
    near(rect(screen, ".blog-post-source").top - cover.bottom, 28);
    near(document.documentElement.scrollHeight - rect(screen, ".blog-post-related").bottom, 96, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  it("makes the cover of a video taller than the others", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "video" });

    near(rect(screen, ".blog-post-cover").height, 440);
    near(rect(screen, ".blog-post-cover").width, 784);
  });

  it("lays out the tablet article in one column with the pill on top", async () => {
    const screen = await renderPost({ width: 768, height: 900, kind: "article" });
    const header = rect(screen, "header").height;
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".blog-post-cover");

    near(nav.left, 32);
    near(nav.width, 704);
    near(nav.top, header + 28);
    near(cover.width, 704);
    near(cover.height, 380);
    near(size(screen, ".blog-post-title"), 40);
    near(size(screen, ".blog-post-text"), 16);
    near(size(screen, ".blog-post-related-title"), 26);
    near(document.documentElement.scrollHeight - rect(screen, ".blog-post-related").bottom, 80, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
  });

  it("lays out the mobile article in one column with the pill on top", async () => {
    const screen = await renderPost({ width: 390, height: 780, kind: "article" });
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".blog-post-cover");

    near(nav.left, 20);
    near(nav.width, 350);
    near(cover.width, 350);
    near(cover.height, 220);
    near(size(screen, ".blog-post-title"), 30);
    near(size(screen, ".blog-post-text"), 14);
    near(size(screen, ".blog-post-related-title"), 22);
    near(document.documentElement.scrollHeight - rect(screen, ".blog-post-related").bottom, 56, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it.each([
    { width: 1440, columns: 2 },
    { width: 768, columns: 2 },
    { width: 390, columns: 1 },
  ])("shows the related posts in $columns column(s) at $width", async ({ width, columns }) => {
    const screen = await renderPost({ width, height: 900, kind: "article" });
    const cells = pickAll(screen, ".blog-post-related-item").map((cell) =>
      cell.getBoundingClientRect(),
    );

    expect(new Set(cells.map((cell) => Math.round(cell.left))).size).toBe(columns);
  });

  it("puts the tags and the related block below the chapters", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const chapters = rect(screen, ".blog-post-chapters");
    const tags = rect(screen, ".blog-post-tags");

    near(tags.top - chapters.bottom, 28);
    expect(rect(screen, ".blog-post-related").top).toBeGreaterThan(tags.bottom);
  });

  it("keeps the text of a chapter 18 pixels below its heading and 30 above the next one", async () => {
    await renderPost({ width: 1440, height: 900, kind: "article" });
    const heading = document.getElementById(article.chapters[1]!.data.id)!;
    const next = document.getElementById(article.chapters[2]!.data.id)!;
    const firstText = heading.parentElement!.querySelector(".page-section-body > :first-child")!;

    near(firstText.getBoundingClientRect().top - heading.getBoundingClientRect().bottom, 18);
    const lastBlock = next.parentElement!.previousElementSibling!.querySelector(
      ".page-section-body > :last-child",
    )!;
    near(next.getBoundingClientRect().top - lastBlock.getBoundingClientRect().bottom, 30, 2);
  });

  it.each([
    { width: 1440, locale: "en" as const },
    { width: 1024, locale: "en" as const },
    { width: 768, locale: "ru" as const },
    { width: 390, locale: "ru" as const },
    { width: 360, locale: "ru" as const },
  ])("keeps everything inside the screen at $width in $locale", async ({ width, locale }) => {
    for (const kind of ["article", "tool", "video"] as const) {
      const screen = await renderPost({ width, height: 900, kind, locale });
      const root = rect(screen, ".blog-post");

      expect(document.documentElement.scrollWidth, kind).toBeLessThanOrEqual(width);
      for (const selector of [
        ".blog-post-header",
        ".blog-post-cover",
        ".blog-post-facts",
        ".blog-post-source",
        ".blog-post-code",
        ".blog-post-table-scroll",
        ".blog-post-tags",
        ".blog-post-related",
        ".page-sections-nav",
        ".page-section-heading",
      ]) {
        for (const element of screen.container.querySelectorAll(selector)) {
          const box = element.getBoundingClientRect();
          expect(box.left, `${kind} ${selector}`).toBeGreaterThanOrEqual(root.left - 0.5);
          expect(box.right, `${kind} ${selector}`).toBeLessThanOrEqual(root.right + 0.5);
        }
      }
      screen.unmount();
    }
  });

  it("scrolls a long code line and a wide table inside their boxes on a phone", async () => {
    const blocks: BlogBlock[] = [
      article.blocks[0]!,
      {
        component: "BlogPostChapter",
        data: {
          id: "wide",
          name: "Wide",
          blocks: [
            {
              component: "BlogPostCode",
              data: { code: `const long = "${"x".repeat(240)}";` },
            },
            {
              component: "BlogPostTable",
              data: {
                columns: ["Option", "What it does", "Default", "Notes"],
                rows: [
                  [
                    "--a-very-long-option-name-that-does-not-wrap",
                    "A description that is long enough to need the room",
                    "./public/some/very/long/default/path.txt",
                    "More text",
                  ],
                ],
              },
            },
          ],
        },
      },
    ];
    const screen = await renderBlocks(blocks, { width: 390, height: 780 }, "en", false);
    const content = rect(screen, ".page-sections-content");
    const code = pick<HTMLElement>(screen, ".blog-post-code-body");
    const scroller = pick<HTMLElement>(screen, ".blog-post-table-scroll");

    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    expect(rect(screen, ".blog-post-code").right).toBeLessThanOrEqual(content.right + 0.5);
    expect(rect(screen, ".blog-post-table-scroll").right).toBeLessThanOrEqual(content.right + 0.5);
    expect(getComputedStyle(code).overflowX).toBe("auto");
    expect(getComputedStyle(code).whiteSpace).toBe("pre");
    expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    expect(getComputedStyle(scroller).overflowX).toBe("auto");
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    expect(code.tabIndex).toBe(0);
    expect(scroller.tabIndex).toBe(0);
  });
});

describe("theme", () => {
  it.each([
    { theme: "torii-synth", radius: 0, cut: 14, tagRadius: 0, tagCut: 5, avatarRadius: 0 },
    { theme: "cyber-sakura", radius: 18, cut: 0, tagRadius: 32, tagCut: 0, avatarRadius: 20 },
  ])("draws the $theme shapes", async ({ theme, radius, cut, tagRadius, tagCut, avatarRadius }) => {
    setTheme(theme);
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const cover = getComputedStyle(pick(screen, ".blog-post-cover"));
    const tag = getComputedStyle(pick(screen, ".blog-post-tags .blog-tag"));
    const avatar = getComputedStyle(pick(screen, ".blog-post-avatar"));

    near(Number.parseFloat(cover.borderTopLeftRadius), radius);
    near(Number.parseFloat(cover.clipPath.slice(8)), cut);
    near(Number.parseFloat(tag.borderTopLeftRadius), tagRadius);
    near(Number.parseFloat(tag.clipPath.slice(8)), tagCut);
    near(Number.parseFloat(avatar.borderTopLeftRadius), avatarRadius);
    for (const selector of [
      ".blog-post-source",
      ".blog-post-source-box",
      ".blog-post-code",
      ".blog-post-code-body",
      ".blog-post-callout",
      ".blog-post-callout-box",
      ".blog-post-avatar",
    ]) {
      const element = screen.container.querySelector(selector);
      if (element)
        expect(getComputedStyle(element).clipPath.startsWith("polygon("), selector).toBe(true);
    }
  });

  it("turns the frames, the avatar and the cover with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const source = pick(screen, ".blog-post-source");
    const code = pick(screen, ".blog-post-code");
    const dark = getComputedStyle(code).backgroundColor;
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    expect(transitioning(source, "border-radius")).toBe(true);
    expect(transitioning(source, "clip-path")).toBe(true);
    expect(transitioning(code, "background-color")).toBe(true);
    expect(transitioning(code, "clip-path")).toBe(true);
    expect(transitioning(pick(screen, ".blog-post-code-body"), "background-color")).toBe(true);
    expect(transitioning(pick(screen, ".blog-post-avatar"), "--blog-post-avatar-from")).toBe(true);
    expect(transitioning(pick(screen, ".blog-post-avatar"), "border-radius")).toBe(true);
    expect(transitioning(pick(screen, ".blog-post-cover"), "clip-path")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(code).backgroundColor).not.toBe(dark);
  });

  it("does not transition with reduced motion", async () => {
    await setReducedMotion("reduce");
    setTheme("torii-synth");
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const targets = [
      ".blog-post-cover",
      ".blog-post-avatar",
      ".blog-post-source",
      ".blog-post-source-box",
      ".blog-post-code",
      ".blog-post-code-body",
      ".blog-post-callout",
      ".blog-post-callout-box",
      ".blog-post-tags .blog-tag",
      ".blog-post-back",
      ".blog-post-related-link",
    ].map((selector) => pick(screen, selector));
    expect(
      document.getAnimations().filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && targets.includes(effect?.target as Element);
      }),
    ).toHaveLength(0);
  });
});

describe("state animations", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("changes the color of the back link and moves its arrow on hover", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const back = pick(screen, ".blog-post-back");
    const icon = pick(screen, ".blog-post-back-icon");
    const idle = getComputedStyle(back).color;

    await userEvent.hover(back);
    expect(transitioning(back, "color")).toBe(true);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(back).color).not.toBe(idle);
    expect(Number.parseFloat(getComputedStyle(icon).translate)).toBeLessThan(0);
  });

  it("lights the source link on hover", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const link = pick(screen, ".blog-source-link");
    const idle = getComputedStyle(link).color;

    await userEvent.hover(link);
    expect(transitioning(link, "color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(link).color).not.toBe(idle);
  });

  it("lights the title and the cover of a related post on hover", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const link = pick(screen, ".blog-post-related-link");
    const name = pick(screen, ".blog-post-related-name");
    const idle = getComputedStyle(name).color;

    link.scrollIntoView({ block: "center" });
    await userEvent.hover(link);
    expect(transitioning(name, "color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(name).color).not.toBe(idle);
    expect(getComputedStyle(name).color).toBe(
      getComputedStyle(pick(screen, ".blog-post-related-kind")).color,
    );
  });

  it("lights the border of a tag on hover", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const item = pick(screen, ".blog-post-tags-item");
    const tag = pick(screen, ".blog-post-tags .blog-tag");
    const idle = getComputedStyle(tag).borderTopColor;

    item.scrollIntoView({ block: "center" });
    await userEvent.hover(item);
    expect(transitioning(tag, "border-color")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(tag).borderTopColor).not.toBe(idle);
  });

  it("lights the cover link of a video on hover", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "video" });
    const link = pick(screen, "a.blog-post-cover");

    await userEvent.hover(link);
    expect(
      document
        .getAnimations()
        .some(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "--page-cover-from",
        ),
    ).toBe(true);
  });

  it("opens the mobile list over the post without moving the content", async () => {
    const screen = await renderPost({ width: 390, height: 780, kind: "article" });
    const before = rect(screen, ".blog-post-header").top;

    pick<HTMLButtonElement>(screen, ".page-sections-nav-head").click();
    await nextTick();
    finishAnimations();

    expect(rect(screen, ".blog-post-header").top).toBe(before);
    expect(getComputedStyle(pick(screen, ".page-sections-nav-panel")).visibility).toBe("visible");
    expect(pick(screen, ".page-sections-nav-head").getAttribute("aria-expanded")).toBe("true");
  });

  it("follows the chapters while scrolling", async () => {
    const screen = await renderPost({ width: 1440, height: 900, kind: "article" });
    const anchors = () => pickAll(screen, ".page-sections-nav-link");
    const current = () =>
      text(anchors().find((link) => link.getAttribute("aria-current") === "location"));
    const second = article.chapters[1]!.data;

    window.scrollTo({
      top: document.getElementById(second.id)!.getBoundingClientRect().top + window.scrollY - 102,
      behavior: "instant",
    });
    await expect.poll(current).toBe(second.name);
    window.scrollTo({ top: 0, behavior: "instant" });
    await expect.poll(current).toBe(article.chapters[0]!.data.name);
  });
});
