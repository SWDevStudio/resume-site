import type { BlogBlock, BlogPostSummary } from "~/assets/api/types/blog";

const postSources = import.meta.glob<{ default: BlogBlock[] }>("../data/blog/posts/*.ts");

export const blog = {
  async fetchPosts(): Promise<BlogPostSummary[]> {
    return (await import("../data/blog/posts.ts")).default;
  },
  async fetchPost(slug: string): Promise<BlogBlock[] | null> {
    const load = postSources[`../data/blog/posts/${slug}.ts`];
    return load ? (await load()).default : null;
  },
};
