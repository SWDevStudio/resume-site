import { describe, expect, it } from "vitest";
import { Route } from "~/assets/const";
import { blogPostBlockNames } from "~/components/pages/blog/BlogPost/blogPostBlocks";
import type {
  BlogBlock,
  BlogPostChapterData,
  BlogPostHeaderData,
  BlogPostRelatedData,
  BlogPostSourceData,
  BlogPostSummary,
  BlogPostTagsData,
} from "~/assets/api/types/blog";
import { $api } from "./index";

const files = import.meta.glob<BlogBlock[]>("../data/blog/posts/*.ts", {
  eager: true,
  import: "default",
});

const bodies = Object.entries(files).map(([path, blocks]) => ({
  slug: /\/([^/]+)\.ts$/.exec(path)![1]!,
  blocks,
}));

function walk(blocks: BlogBlock[]): BlogBlock[] {
  return blocks.flatMap((block) => [
    block,
    ...(block.component === "BlogPostChapter"
      ? walk((block.data as unknown as BlogPostChapterData).blocks)
      : []),
  ]);
}

function find<T>(blocks: BlogBlock[], component: string) {
  return blocks.find((block) => block.component === component)?.data as T | undefined;
}

describe("$api.blog.fetchPosts", () => {
  it("returns the catalog posts as a promise", async () => {
    const result = $api.blog.fetchPosts();

    expect(result).toBeInstanceOf(Promise);
    expect((await result).length).toBe(7);
  });

  it("gives every kind of the catalog its posts and counts", async () => {
    const posts = await $api.blog.fetchPosts();
    const counts = Object.fromEntries(
      (["article", "tool", "video"] as const).map((kind) => [
        kind,
        posts.filter((post) => post.kind === kind).length,
      ]),
    );

    expect(counts).toEqual({ article: 3, tool: 2, video: 2 });
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(posts.length);
  });

  it("keeps the slugs unique and the fields of every kind filled", async () => {
    const posts = await $api.blog.fetchPosts();

    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.title, post.slug).not.toBe("");
      expect(post.excerpt, post.slug).not.toBe("");
      expect(post.publishedAt, post.slug).not.toBe("");
      expect(post.tags.length, post.slug).toBeGreaterThan(0);
      expect(post.source.url, post.slug).toMatch(/^https:\/\//);
      if (post.kind === "article") expect(post.readMinutes).toBeGreaterThan(0);
      if (post.kind === "tool") {
        for (const key of ["stars", "forks", "language", "license", "version"] as const) {
          expect(post[key], `${post.slug} ${key}`).not.toBe("");
        }
      }
      if (post.kind === "video") expect(post.duration).toMatch(/^\d+:\d{2}$/);
    }
  });

  it("matches the cover to the kind", async () => {
    const posts = await $api.blog.fetchPosts();
    const cover = { article: "text", tool: "terminal", video: "video" };

    for (const post of posts) expect(post.cover.type, post.slug).toBe(cover[post.kind]);
  });
});

describe("$api.blog.fetchPost", () => {
  it("loads the blocks of every catalog post", async () => {
    for (const post of await $api.blog.fetchPosts()) {
      const blocks = await $api.blog.fetchPost(post.slug);

      expect(Array.isArray(blocks), post.slug).toBe(true);
      expect(blocks!.length, post.slug).toBeGreaterThan(0);
    }
  });

  it("loads lazily and returns a promise", () => {
    expect($api.blog.fetchPost("seo-for-llms")).toBeInstanceOf(Promise);
  });

  it.each([
    "",
    "unknown",
    "SEO-FOR-LLMS",
    "seo-for-llms/",
    "seo-for-llms.ts",
    "../posts",
    "../posts/seo-for-llms",
    "../../projects/qwixit",
    "..%2Fposts%2Fseo-for-llms",
    "__proto__",
    "constructor",
  ])("returns null for the unknown slug %j", async (slug) => {
    expect(await $api.blog.fetchPost(slug)).toBeNull();
  });
});

describe("blog data files", () => {
  it("has a body file for every catalog post and no extra ones", async () => {
    const posts = await $api.blog.fetchPosts();

    expect(bodies.map((body) => body.slug).sort()).toEqual(posts.map((post) => post.slug).sort());
  });

  it.each(bodies)("uses only known blocks in $slug", ({ blocks }) => {
    for (const block of walk(blocks)) expect(blogPostBlockNames).toContain(block.component);
  });

  it.each(bodies)("keeps the page skeleton of $slug", ({ blocks }) => {
    const top = blocks.map((block) => block.component);
    const chapters = blocks.filter((block) => block.component === "BlogPostChapter");

    expect(top.slice(0, 2)).toEqual(["BlogPostHeader", "BlogPostCover"]);
    expect(top.at(-2)).toBe("BlogPostTags");
    expect(top.at(-1)).toBe("BlogPostRelated");
    expect(top).toContain("BlogPostSource");
    expect(chapters.length).toBeGreaterThanOrEqual(2);
    expect(top.filter((name) => name === "BlogPostHeader")).toHaveLength(1);
  });

  it.each(bodies)("makes the first chapter of $slug the hidden intro", ({ blocks }) => {
    const first = find<BlogPostChapterData>(blocks, "BlogPostChapter")!;

    expect(first.id).toBe("intro");
    expect(first.hidden).toBe(true);
  });

  it.each(bodies)("keeps the chapter ids of $slug unique and anchor-safe", ({ blocks }) => {
    const ids = walk(blocks)
      .filter((block) => block.component === "BlogPostChapter")
      .map((block) => (block.data as unknown as BlogPostChapterData).id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it.each(bodies)(
    "takes the facts, source and tags of $slug from the catalog",
    async ({ slug, blocks }) => {
      const summary = (await $api.blog.fetchPosts()).find((post) => post.slug === slug)!;
      const header = find<BlogPostHeaderData>(blocks, "BlogPostHeader")!;

      expect(summary, slug).toBeDefined();
      expect(header.slug).toBe(summary.slug);
      expect(header.kind).toBe(summary.kind);
      expect(header.title).toBe(summary.title);
      expect(header.publishedAt).toBe(summary.publishedAt);
      expect(header.author.initials).not.toBe("");
      expect(find<{ cover: unknown }>(blocks, "BlogPostCover")!.cover).toEqual(summary.cover);
      expect(find<BlogPostSourceData>(blocks, "BlogPostSource")).toEqual({
        kind: summary.kind,
        source: summary.source,
      });
      expect(find<BlogPostTagsData>(blocks, "BlogPostTags")!.tags).toEqual(summary.tags);
      expect(Boolean(find(blocks, "BlogPostFacts"))).toBe(summary.kind === "tool");
    },
  );

  it.each(bodies)(
    "links $slug only to existing posts with the catalog data",
    async ({ slug, blocks }) => {
      const posts = await $api.blog.fetchPosts();
      const items = find<BlogPostRelatedData>(blocks, "BlogPostRelated")!.items;

      expect(items.length).toBe(2);
      for (const item of items) {
        const target: BlogPostSummary | undefined = posts.find((post) => post.slug === item.slug);

        expect(target, item.slug).toBeDefined();
        expect(item.slug).not.toBe(slug);
        expect(item.kind).toBe(target!.kind);
        expect(item.title).toBe(target!.title);
        expect(item.cover).toEqual(target!.cover);
        expect(Route.post(item.slug)).toBe(`/blog/${item.slug}`);
      }
    },
  );

  it("keeps the tables rectangular", () => {
    for (const body of bodies) {
      for (const block of walk(body.blocks)) {
        if (block.component !== "BlogPostTable") continue;
        const { columns, rows } = block.data as unknown as {
          columns: string[];
          rows: string[][];
        };

        for (const row of rows) expect(row.length, body.slug).toBe(columns.length);
      }
    }
  });
});
