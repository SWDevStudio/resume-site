import { describe, expect, it } from "vitest";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import type { BlogKind, BlogPostSummary } from "~/assets/api/types/blog";
import { countBlogKinds } from "./blogCatalog";
import { blogTone, blogToneClass } from "./blogTone";

describe("blogTone", () => {
  it.each([
    { kind: "article" as BlogKind, tone: "primary" },
    { kind: "tool" as BlogKind, tone: "secondary" },
    { kind: "video" as BlogKind, tone: "accent" },
  ])("gives the $kind the $tone tone", ({ kind, tone }) => {
    expect(blogTone(kind)).toBe(tone);
    expect(blogToneClass(kind)).toEqual(["page-tone", `page-tone-${tone}`]);
  });

  it("falls back to the primary tone for a kind it does not know", () => {
    expect(blogTone("podcast" as BlogKind)).toBe("primary");
  });
});

describe("countBlogKinds", () => {
  it("lists the kinds in the order they first appear in the data and counts each one", async () => {
    const posts = await $api.blog.fetchPosts();
    const counts = countBlogKinds(posts);

    expect(counts.map(({ kind }) => kind)).toEqual([...new Set(posts.map((post) => post.kind))]);
    for (const { kind, count } of counts) {
      expect(count).toBe(posts.filter((post) => post.kind === kind).length);
    }
    expect(counts.reduce((sum, { count }) => sum + count, 0)).toBe(posts.length);
  });

  it("follows the order of the posts and not a fixed order of kinds", async () => {
    const posts = await $api.blog.fetchPosts();
    const video = posts.find((post) => post.kind === "video")!;
    const article = posts.find((post) => post.kind === "article")!;

    expect(countBlogKinds([video, article]).map(({ kind }) => kind)).toEqual(["video", "article"]);
    expect(countBlogKinds([article, video]).map(({ kind }) => kind)).toEqual(["article", "video"]);
  });

  it("skips a kind without posts and gives nothing for an empty catalog", async () => {
    const posts = (await $api.blog.fetchPosts()).filter(
      (post): post is BlogPostSummary => post.kind !== "tool",
    );

    expect(countBlogKinds(posts).map(({ kind }) => kind)).not.toContain("tool");
    expect(countBlogKinds([])).toEqual([]);
  });
});

describe("Route.post", () => {
  it("points a post at its page", () => {
    expect(Route.post("seo-for-llms")).toBe("/blog/seo-for-llms");
  });
});

function keys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}.${key}`));
}

describe("blog locales", () => {
  it("has the same keys in English and Russian", () => {
    expect(keys(ru.blog).sort()).toEqual(keys(en.blog).sort());
  });

  it("covers every kind in the labels, sections, sources and buttons", () => {
    for (const kind of ["article", "tool", "video"] as const) {
      expect(en.blog.kind[kind]).toBeTruthy();
      expect(ru.blog.kind[kind]).toBeTruthy();
      expect(en.blog.sections[kind]).toBeTruthy();
      expect(en.blog.card.source[kind]).toBeTruthy();
      expect(en.blog.card.cta[kind]).toBeTruthy();
      expect(en.blog.post.source[kind]).toBeTruthy();
    }
  });

  it("keeps the platform names out of the locale files", () => {
    for (const locale of [en.blog, ru.blog]) {
      expect(JSON.stringify(locale)).not.toMatch(/GitHub|YouTube|habr/);
    }
  });
});
