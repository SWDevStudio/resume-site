import type { ProjectView, SkillGroupView } from "#shared/types/catalog";
import type { ProjectBlock } from "~/types/projectCase";
import { blog } from "./blog";
import { contact } from "./contact";
import { buildCase, buildProjects, buildResume, buildSkillGroups } from "#shared/mock/build";
import { resolveLocale } from "./locale";
import {
  loadCaseBlocks,
  loadProjectsSources,
  loadResumeSources,
  loadSkillsSources,
} from "./sources";
import type { ResumeData } from "#shared/types/resume";

const profile = {
  async fetchResume(): Promise<ResumeData> {
    const locale = resolveLocale();
    return buildResume(await loadResumeSources(locale), locale);
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

export const $api = { profile, projects, skills, blog, contact };
