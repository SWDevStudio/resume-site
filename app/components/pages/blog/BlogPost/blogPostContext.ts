import type { ComputedRef, InjectionKey } from "vue";
import type { BlogPostSourceData } from "~/assets/api/types/blog";

export const BLOG_POST_SOURCE: InjectionKey<ComputedRef<BlogPostSourceData | null>> =
  Symbol("blog-post-source");
