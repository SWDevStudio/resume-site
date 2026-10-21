import type { ResumeSources, SkillsText } from "../types/catalog";
import { DEFAULT_LOCALE, type Locale } from "../../app/assets/const/locale";
import { buildSkillRegistry } from "./build/skills";
import { projects, projectsText } from "../../app/assets/data/projects";
import skills from "../../app/assets/data/canon/skills";
import enResume from "../../app/assets/data/en/resume";
import enSkillsText from "../../app/assets/data/en/skills";
import ruResume from "../../app/assets/data/ru/resume";
import ruSkillsText from "../../app/assets/data/ru/skills";

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
