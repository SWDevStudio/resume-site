import type { BlogKind } from "~/types/blog";

export type BlogFilter = "all" | BlogKind;

export interface BlogFilterOption {
  key: BlogFilter;
  count: number;
}
