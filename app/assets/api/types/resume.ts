export interface ResumeContact {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface ResumeItem {
  lead?: string;
  text: string;
}

export interface ResumeListEntry extends ResumeItem {
  term?: boolean;
}

export interface ResumeSkill {
  id: string;
  name: string;
}

export const SKILL_GROUP_IDS = ["frontend", "backend", "lead", "additional"] as const;

export type SkillGroupId = (typeof SKILL_GROUP_IDS)[number];

export interface ResumeSkillGroup {
  id: string;
  name: string;
  terms: boolean;
  skills: ResumeSkill[];
}

export interface ResumeLink {
  label: string;
  href: string | null;
}

export interface ResumeProject {
  id: string;
  index: string;
  name: string;
  link: ResumeLink;
  subtitle: string;
  description: string;
  role: string;
  result: string;
  tags: string[];
}

export interface ResumeCase {
  id: string;
  name: string;
  period?: string;
  role?: string;
  description: string;
  points: string[];
  stack: string[];
}

export interface ResumeJob {
  id: string;
  title: string;
  company: string;
  site?: string;
  field?: string;
  period: string;
  duration: string;
  team: string;
  projects: ResumeItem[];
  responsibilities: string[];
  achievements: string[];
  stack: string[];
  practices: string[];
}

export interface ResumeExperienceLabels {
  team: string;
  projects: string;
  responsibilities: string;
  achievements: string;
  stack: string;
}

export interface ResumeSectionHead {
  id: string;
  label: string;
  name: string;
}

export interface ResumeProfile {
  caption: string;
  firstName: string;
  lastName: string;
  role: string;
  contacts: ResumeContact[];
}

export interface ProfilePerson {
  name: string;
  alternateNames: string[];
  role: string;
  skills: string[];
}

export interface ResumeData {
  profile: ResumeProfile;
  summary: ResumeSectionHead & { paragraphs: string[] };
  skills: ResumeSectionHead & { groups: ResumeSkillGroup[] };
  projects: ResumeSectionHead & { items: ResumeProject[] };
  experience: ResumeSectionHead & {
    total: string;
    labels: ResumeExperienceLabels;
    jobs: ResumeJob[];
  };
  cases: ResumeSectionHead & { items: ResumeCase[] };
  education: ResumeSectionHead & { items: ResumeItem[] };
  additional: ResumeSectionHead & { items: ResumeItem[] };
  ai: ResumeSectionHead & { paragraphs: string[]; link?: ResumeLink };
  references: ResumeSectionHead & { items: ResumeItem[] };
  footer: { copyright: string; latestVersion: string };
}
