import type { BlogKind, BlogPostSummary } from "~/assets/api/types/blog";

export interface BlogKindCount {
  kind: BlogKind;
  count: number;
}

export function countBlogKinds(posts: BlogPostSummary[]): BlogKindCount[] {
  const counts = new Map<BlogKind, number>();
  for (const post of posts) counts.set(post.kind, (counts.get(post.kind) ?? 0) + 1);
  return [...counts].map(([kind, count]) => ({ kind, count }));
}
