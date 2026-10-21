import type { Tone } from "#shared/types/catalog";

export type ProjectCaseTone = Tone;

export interface ProjectBlock {
  component: string;
  data: Record<string, unknown>;
}

export interface ProjectCaseHeaderData {
  index: string;
  subtitle: string;
  name: string;
  headline: string;
  url: string | null;
  tone: ProjectCaseTone;
}

export interface ProjectCaseCoverData {
  image: string;
  imageAlt: string;
}

export interface ProjectCaseMetaData {
  tags: string[];
  stack: string[];
}

export interface ProjectCaseChapterData {
  id: string;
  name: string;
  blocks: ProjectBlock[];
}

export interface ProjectCaseTextData {
  text: string;
}

export interface ProjectCaseStat {
  value: string;
  label: string;
}

export interface ProjectCaseResultsData {
  stats: ProjectCaseStat[];
}

export interface ProjectCaseNextData {
  slug: string;
  name: string;
  index: string;
  tone: ProjectCaseTone;
}
