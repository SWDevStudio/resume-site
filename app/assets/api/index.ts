import type { ProjectView, SkillGroupView } from "#shared/types/catalog";
import { contact } from "./contact";
import { buildProjects, buildResume, buildSkillGroups } from "#shared/mock/build";
import { resolveLocale } from "./locale";
import { loadProjectsSources, loadResumeSources, loadSkillsSources } from "./sources";
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
};

const skills = {
  async fetchGroups(): Promise<SkillGroupView[]> {
    const locale = resolveLocale();
    return buildSkillGroups(await loadSkillsSources(locale), locale);
  },
};

export const $api = { profile, projects, skills, contact };
