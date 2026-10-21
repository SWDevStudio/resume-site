import type {
  ProjectCanon,
  ProjectsText,
  ResumeSources,
  SkillsCanon,
  SkillsText,
} from "../types/catalog";
import { DEFAULT_LOCALE, type Locale } from "../../app/assets/const/locale";
import { buildSkillRegistry } from "./build/skills";
import projects from "../../app/assets/data/canon/projects.json";
import skills from "../../app/assets/data/canon/skills.json";
import enProjectsText from "../../app/assets/data/en/projects.json";
import enResume from "../../app/assets/data/en/resume.json";
import enSkillsText from "../../app/assets/data/en/skills.json";
import ruProjectsText from "../../app/assets/data/ru/projects.json";
import ruResume from "../../app/assets/data/ru/resume.json";
import ruSkillsText from "../../app/assets/data/ru/skills.json";

const projectsText: Record<"ru" | "en", ProjectsText> = {
  ru: ruProjectsText,
  en: enProjectsText,
};

const skillsText: Record<"ru" | "en", SkillsText> = {
  ru: ruSkillsText,
  en: enSkillsText,
};

export function staticSources(locale: Locale = DEFAULT_LOCALE): ResumeSources {
  const skillsCanon = skills as SkillsCanon;
  return {
    projects: projects as ProjectCanon[],
    projectsText,
    skills: skillsCanon,
    skillsText,
    registry: buildSkillRegistry({ skills: skillsCanon, skillsText }, locale),
    resume: { ru: ruResume, en: enResume },
  };
}
