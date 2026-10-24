import type {
  ResumeData,
  ResumeItem,
  ResumeSectionHead,
  ResumeContact,
  ResumeExperienceLabels,
} from "./resume";
import type { Locale } from "../../app/assets/const/locale";

export type Tone = "primary" | "secondary" | "accent";

export type StackRef =
  | string
  | {
      id: string;
      label: string;
    };

export interface ProjectCanon {
  isFavorite: boolean;
  id: string;
  name: string;
  tone: Tone;
  url: string | null;
  preview: string;
  tags: string[];
  stack: StackRef[];
}

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

export interface ProjectDefinition extends ProjectCanon {
  text: Record<Locale, ProjectText>;
}

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
  city: string;
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
    specialization: string;
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
  personal: ResumeSectionHead & { items: ResumeData["personal"]["items"] };
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
  preview: string;
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

export interface ProjectsSources {
  projects: ProjectCanon[];
  projectsText: ByLocale<ProjectsText>;
  registry?: SkillRegistry;
}

export interface SkillsSources {
  skills: SkillsCanon;
  skillsText: ByLocale<SkillsText>;
}

export type ResumeFile = Omit<ResumeData, "skills" | "projects"> & {
  skills: ResumeSectionHead;
  projects: ResumeSectionHead;
};

export interface ResumeSources extends ProjectsSources, SkillsSources {
  resume: ByLocale<ResumeFile>;
}
