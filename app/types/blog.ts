export type BlogKind = "article" | "tool" | "video";
export type BlogTone = "primary" | "secondary" | "accent";

export interface BlogBlock {
  component: string;
  data: Record<string, unknown>;
}

export interface BlogSource {
  name: string;
  url: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  initials: string;
}

export interface BlogCoverLine {
  text: string;
  scale?: number;
  muted?: boolean;
  strike?: boolean;
  indent?: number;
}

export interface BlogCoverText {
  type: "text";
  lines: BlogCoverLine[];
}

export interface BlogCoverTerminal {
  type: "terminal";
  title: string;
  command: string;
  output: string;
}

export interface BlogCoverVideo {
  type: "video";
  title: string;
  duration: string;
}

export type BlogCover = BlogCoverText | BlogCoverTerminal | BlogCoverVideo;

export type BlogCoverSize = "card" | "hero" | "compact";

interface BlogPostHeadBase {
  slug: string;
  title: string;
  publishedAt: string;
}

export interface BlogArticleHead extends BlogPostHeadBase {
  kind: "article";
  readMinutes: number;
}

export interface BlogToolHead extends BlogPostHeadBase {
  kind: "tool";
  stars: string;
  forks: string;
  language: string;
  license: string;
  version: string;
}

export interface BlogVideoHead extends BlogPostHeadBase {
  kind: "video";
  duration: string;
}

export type BlogPostHead = BlogArticleHead | BlogToolHead | BlogVideoHead;

export type BlogPostSummary = BlogPostHead & {
  excerpt: string;
  tags: string[];
  cover: BlogCover;
  source: BlogSource;
};

export type BlogPostHeaderData = BlogPostHead & { author: BlogAuthor };

export interface BlogPostCoverData {
  cover: BlogCover;
}

export interface BlogPostFactsData {
  stars: string;
  forks: string;
  language: string;
  license: string;
  version: string;
}

export interface BlogPostSourceData {
  kind: BlogKind;
  source: BlogSource;
}

export interface BlogPostChapterData {
  id: string;
  name: string;
  hidden?: boolean;
  blocks: BlogBlock[];
}

export interface BlogPostTextData {
  text: string;
}

export interface BlogPostListData {
  ordered: boolean;
  items: string[];
}

export interface BlogPostCodeData {
  code: string;
  language?: string;
}

export type BlogCalloutVariant = "tip" | "note" | "warning";

export interface BlogPostCalloutData {
  variant: BlogCalloutVariant;
  text: string;
}

export interface BlogPostTableData {
  columns: string[];
  rows: string[][];
}

export interface BlogPostTagsData {
  tags: string[];
}

export interface BlogRelatedItem {
  slug: string;
  kind: BlogKind;
  title: string;
  cover: BlogCover;
}

export interface BlogPostRelatedData {
  items: BlogRelatedItem[];
}
