import type { ResumeSources, SkillsText } from "../types/catalog";
import { DEFAULT_LOCALE, type Locale } from "../../const/locale";
import { buildSkillRegistry } from "./build/skills";
import { projects, projectsText } from "../../data/projects";
import skills from "../../data/canon/skills";
import enResume from "../../data/en/resume";
import enSkillsText from "../../data/en/skills";
import ruResume from "../../data/ru/resume";
import ruSkillsText from "../../data/ru/skills";

const skillsText: Record<"ru" | "en", SkillsText> = {
  ru: ruSkillsText,
  en: enSkillsText,
};

export function staticSources(locale: Locale = DEFAULT_LOCALE): ResumeSources {
  return {
    projects,
    projectsText,
    skills,
    skillsText,
    registry: buildSkillRegistry({ skills, skillsText }, locale),
    resume: { ru: ruResume, en: enResume },
  };
}
