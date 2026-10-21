import type { ResumeData, ResumeProject } from "../../types/resume";
import type { ProjectView, ResumeSources } from "../../types/catalog";
import type { Locale } from "../../../app/assets/const/locale";
import { firstDefined, textLayers } from "./layers";
import { buildProjects } from "./projects";
import { buildSkillGroups } from "./skills";

export function toResumeProject(project: ProjectView, linkPlaceholder: string): ResumeProject {
  return {
    id: project.id,
    index: project.index,
    name: project.name,
    link: { label: project.host ?? linkPlaceholder, href: project.url },
    subtitle: project.subtitle,
    description: project.description,
    role: project.role,
    result: project.result,
    tags: project.tags,
  };
}

export function buildResume(src: ResumeSources, locale: Locale): ResumeData {
  const resume = firstDefined(textLayers(src.resume, locale), (layer) => layer);
  if (!resume) throw new Error(`Resume data for "${locale}" is missing`);
  const groups = buildSkillGroups(src, locale).map((group) => ({
    id: group.id,
    name: group.name,
    terms: group.terms,
    skills: group.skills.map((skill) => ({ id: skill.id, name: skill.name })),
  }));
  const linkPlaceholder =
    firstDefined(textLayers(src.projectsText, locale), (layer) => layer.linkPlaceholder) ?? "";
  const items = buildProjects(src, locale).map((project) =>
    toResumeProject(project, linkPlaceholder),
  );
  return {
    ...resume,
    skills: { ...resume.skills, groups },
    projects: { ...resume.projects, items },
  };
}
