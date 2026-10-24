import type { ProjectStackItem, Tone } from "./catalog";

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
  imageMobile: string | null;
  imageAlt: string;
}

export interface ProjectCaseMetaData {
  tags: string[];
  stack: ProjectStackItem[];
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

export type ProjectCaseFactKey = "role" | "team" | "duration" | "status";

export interface ProjectCaseFact {
  key: ProjectCaseFactKey;
  value: string;
}

export interface ProjectCaseFactsData {
  facts: ProjectCaseFact[];
}

export interface ProjectCaseCard {
  title: string;
  text: string;
}

export interface ProjectCaseRoleData {
  id: string;
  name: string;
  items: ProjectCaseCard[];
}

export interface ProjectCaseGoalData {
  value: string;
  text: string;
}

export interface ProjectCaseStepsData {
  steps: ProjectCaseCard[];
}

export interface ProjectCaseArchitectureItem {
  label: string;
  title: string;
  text?: string;
  code?: string[];
}

export interface ProjectCaseArchitectureData {
  items: ProjectCaseArchitectureItem[];
}

export interface ProjectCaseIntegration {
  label: string;
  own?: boolean;
  term?: boolean;
}

export interface ProjectCaseIntegrationsData {
  items: ProjectCaseIntegration[];
}

export interface ProjectCasePipelineStage {
  name: string;
  next?: string;
}

export interface ProjectCasePipelineData {
  stages: ProjectCasePipelineStage[];
}

export type ProjectCaseChallengeRowKey = "problem" | "solution" | "result" | "retro";

export interface ProjectCaseChallengeRow {
  key: ProjectCaseChallengeRowKey;
  text: string;
}

export interface ProjectCaseChallenge {
  id: string;
  name: string;
  rows: ProjectCaseChallengeRow[];
}

export interface ProjectCaseChallengesData {
  items: ProjectCaseChallenge[];
}

export interface ProjectCaseCtaData {
  id: string;
  title: string;
  text: string;
  url: string | null;
}
