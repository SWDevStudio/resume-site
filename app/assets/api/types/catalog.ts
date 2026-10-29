import type {
  ResumeData,
  ResumeItem,
  ResumeSectionHead,
  ResumeContact,
  ResumeExperienceLabels,
} from "./resume";
import type { Locale } from "../../const/locale";
import type { ImageAsset } from "./media";
import type { ResumeInfographic } from "./resumeInfographic";

export type Tone = "primary" | "secondary" | "accent";

export type PreviewFrame = "devices" | "terminal";

export type StackRef =
  | string
  | {
      id: string;
      label: string;
    };

export interface ProjectStackItem {
  label: string;
  own?: boolean;
}

interface ProjectFacts {
  isFavorite: boolean;
  id: string;
  name: string;
  tone: Tone;
  url: string | null;
  previewFrame?: PreviewFrame;
  tags: string[];
  stack: StackRef[];
  caseStack?: ProjectStackItem[];
}

export type ProjectPreviewCanon =
  { preview: string; previewMobile?: string } | { preview?: never; previewMobile: string };

export type ProjectCanon = ProjectFacts & ProjectPreviewCanon;

export interface SkillCanon {
  id: string;
  kind: "tech" | "soft";
  label?: string;
}

export interface SkillGroupCanon {
  id: string;
  kind: "tech" | "soft";
  skills: SkillCanon[];
}

export interface SkillsCanon {
  groups: SkillGroupCanon[];
}

export interface JobCanon {
  id: string;
  site?: string;
  project?: string;
  stack: StackRef[];
}

export interface ProfileCanon {
  brand: string;
  role: string;
  stack: StackRef[];
  contacts: Array<"telegram" | "email">;
  updatedAt: string;
}

export type ProjectDefinition = ProjectCanon & {
  text: Record<Locale, ProjectText>;
};

export interface ProjectText {
  subtitle: string;
  headline: string;
  description: string;
  previewAlt: string;
  role: string;
  result: string;
}

export interface ProjectsText {
  linkPlaceholder: string;
  tags: Record<string, string>;
  items: Record<string, ProjectText>;
}

export interface SkillsText {
  groups: Record<string, string>;
  skills: Record<string, string>;
}

export interface JobText {
  title: string;
  company: string;
  field?: string;
  period: string;
  duration: string;
  team: string;
  projects: ResumeItem[];
  responsibilities: string[];
  achievements: string[];
  practices: string[];
}

export interface ResumeNarrative {
  profile: {
    caption: string;
    firstName: string;
    lastName: string;
    contacts: ResumeContact[];
  };
  summary: ResumeSectionHead & { paragraphs: string[] };
  skills: ResumeSectionHead;
  projects: ResumeSectionHead;
  experience: ResumeSectionHead & {
    total: string;
    labels: ResumeExperienceLabels;
    jobs: Record<string, JobText>;
  };
  education: ResumeSectionHead & { items: ResumeItem[] };
  additional: ResumeSectionHead & { items: ResumeItem[] };
  ai: ResumeSectionHead & { paragraphs: string[] };
  references: ResumeSectionHead & { items: ResumeItem[] };
}

export interface ProjectView {
  isFavorite: boolean;
  id: string;
  index: string;
  name: string;
  tone: Tone;
  url: string | null;
  host: string | null;
  preview: ImageAsset | null;
  previewMobile: ImageAsset | null;
  previewFrame: PreviewFrame;
  previewAlt: string;
  subtitle: string;
  headline: string;
  description: string;
  tags: string[];
  stack: string[];
  role: string;
  result: string;
}

export interface SkillView {
  id: string;
  name: string;
  label: string;
}

export interface SkillGroupView {
  id: string;
  name: string;
  terms: boolean;
  skills: SkillView[];
}

export interface SkillRegistryEntry {
  name?: string;
  label?: string;
}

export type SkillRegistry = Record<string, SkillRegistryEntry>;

export type ByLocale<T> = Partial<Record<Locale, T>>;

export type ProjectMediaResolver = (path: string) => ImageAsset | undefined;

export interface ProjectsSources {
  projects: ProjectCanon[];
  projectsText: ByLocale<ProjectsText>;
  registry?: SkillRegistry;
  media?: ProjectMediaResolver;
}

export interface SkillsSources {
  skills: SkillsCanon;
  skillsText: ByLocale<SkillsText>;
}

export type ResumeFile = Omit<ResumeData, "skills" | "projects"> & {
  skills: ResumeSectionHead;
  projects: ResumeSectionHead;
};

export interface PersonCanon {
  alternateNames: string[];
}

export interface PersonSources extends SkillsSources {
  person: PersonCanon;
  resume: ByLocale<ResumeFile>;
}

export interface ResumeSources extends ProjectsSources, SkillsSources {
  resume: ByLocale<ResumeFile>;
}

export type ResumeInfographicFile = Omit<ResumeInfographic, "name" | "ai"> & {
  ai: Omit<ResumeInfographic["ai"], "link">;
};

export interface ResumeInfographicSources {
  resume: ByLocale<ResumeFile>;
  resumeInfographic: ByLocale<ResumeInfographicFile>;
}
