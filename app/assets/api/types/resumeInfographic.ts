import type { ResumeContact, ResumeLink } from "./resume";

export const INFOGRAPHIC_ROLES = ["frontend", "fullstack", "lead"] as const;

export type InfographicRole = (typeof INFOGRAPHIC_ROLES)[number];

export interface YearMonth {
  year: number;
  month: number;
}

export interface InfographicTimeline {
  from: number;
  to: number;
  now: YearMonth;
}

export interface InfographicJob {
  id: string;
  company: string;
  title: string;
  team: string;
  role: InfographicRole;
  start: YearMonth;
  end: YearMonth | null;
}

export interface InfographicChange {
  kind: "change";
  label: string;
  before: number;
  after: number;
  show: "values" | "delta";
  approx?: boolean;
}

export interface InfographicTarget {
  kind: "target";
  label: string;
  targetLabel: string;
  max: number;
  target: number;
  from: number;
  to: number;
}

export interface InfographicStat {
  kind: "stat";
  label: string;
  value: number;
  unit?: string;
  approx?: boolean;
  plus?: boolean;
  accent?: boolean;
}

export interface InfographicNote {
  kind: "note";
  lines: string[];
}

export type InfographicMetric =
  InfographicChange | InfographicTarget | InfographicStat | InfographicNote;

export type InfographicMetaPart = string | { job: string };

export interface InfographicProject {
  id: string;
  name: string;
  meta: InfographicMetaPart[];
  stack: string[];
  points: string[];
  metrics: InfographicMetric[];
}

export interface InfographicStackGroup {
  name: string;
  items: string[];
}

export interface InfographicFact {
  id: string;
  title: string;
  lines: string[];
  note?: string;
}

export interface ResumeInfographic {
  name: string;
  headline: string;
  contacts: ResumeContact[];
  summary: { title: string; paragraphs: string[] };
  experience: {
    title: string;
    total: string;
    present: string;
    roles: Record<InfographicRole, string>;
    timeline: InfographicTimeline;
    jobs: InfographicJob[];
  };
  stack: { title: string; groups: InfographicStackGroup[] };
  projects: {
    title: string;
    main: InfographicProject[];
    more: InfographicProject[];
    earlier: InfographicProject[];
  };
  products: { title: string; items: InfographicProject[] };
  ai: { title: string; text: string; link?: ResumeLink; metrics: InfographicMetric[] };
  facts: InfographicFact[];
}
