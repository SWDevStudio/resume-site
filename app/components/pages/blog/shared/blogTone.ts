import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { BlogKind, BlogTone } from "~/assets/api/types/blog";

const TONES: Partial<Record<BlogKind, BlogTone>> = {
  article: "primary",
  tool: "secondary",
  video: "accent",
};

export function blogTone(kind: BlogKind): BlogTone {
  return TONES[kind] ?? "primary";
}

export function blogToneClass(kind: BlogKind) {
  return pageToneClass(blogTone(kind));
}
