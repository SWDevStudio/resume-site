import type { ProjectView, SkillGroupView } from "~/assets/api/types/catalog";
import type { ProjectBlock } from "~/assets/api/types/projectCase";
import { assistant } from "./assistant";
import { blog } from "./blog";
import { contact } from "./contact";
import {
  buildCase,
  buildPerson,
  buildProjects,
  buildResume,
  buildSkillGroups,
} from "~/assets/api/mock/build";
import { resolveLocale } from "./locale";
import {
  loadCaseBlocks,
  loadPersonSources,
  loadProjectsSources,
  loadResumeSources,
  loadSkillsSources,
} from "./sources";
import type { ProfilePerson, ResumeData } from "~/assets/api/types/resume";

const profile = {
  async fetchResume(): Promise<ResumeData> {
    const locale = resolveLocale();
    return buildResume(await loadResumeSources(locale), locale);
  },
  async fetchPerson(): Promise<ProfilePerson> {
    const locale = resolveLocale();
    return buildPerson(await loadPersonSources(locale), locale);
  },
};

const projects = {
  async fetchList(): Promise<ProjectView[]> {
    const locale = resolveLocale();
    return buildProjects(await loadProjectsSources(locale), locale);
  },
  async fetchCase(slug: string): Promise<ProjectBlock[] | null> {
    const locale = resolveLocale();
    const [src, blocks] = await Promise.all([
      loadProjectsSources(locale),
      loadCaseBlocks(slug, locale),
    ]);
    return buildCase(slug, src, blocks, locale);
  },
};

const skills = {
  async fetchGroups(): Promise<SkillGroupView[]> {
    const locale = resolveLocale();
    return buildSkillGroups(await loadSkillsSources(locale), locale);
  },
};

export const $api = { profile, projects, skills, blog, contact, assistant };
