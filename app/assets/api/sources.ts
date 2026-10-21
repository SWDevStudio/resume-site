import type {
  ProjectsSources,
  ResumeFile,
  ResumeSources,
  SkillsSources,
  SkillsText,
} from "#shared/types/catalog";
import { DEFAULT_LOCALE, type Locale } from "../const/locale";
import { buildSkillRegistry } from "#shared/mock/build/skills";

const textSkills = import.meta.glob<SkillsText>("../data/*/skills.ts", {
  import: "default",
});
const textResume = import.meta.glob<ResumeFile>("../data/*/resume.ts", { import: "default" });

function localeLayers(locale: Locale): Locale[] {
  return locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];
}

async function loadTexts<T>(
  files: Record<string, () => Promise<T>>,
  name: string,
  locale: Locale,
): Promise<Partial<Record<Locale, T>>> {
  const entries = await Promise.all(
    localeLayers(locale).map(async (layer) => {
      const path = `../data/${layer}/${name}.ts`;
      return [layer, await files[path]?.()] as const;
    }),
  );
  return Object.fromEntries(entries.filter(([, data]) => data !== undefined));
}

export async function loadSkillsSources(locale: Locale): Promise<SkillsSources> {
  const [skills, skillsText] = await Promise.all([
    import("../data/canon/skills").then((module) => module.default),
    loadTexts(textSkills, "skills", locale),
  ]);
  return { skills, skillsText };
}

export async function loadProjectsSources(locale: Locale): Promise<ProjectsSources> {
  const [{ projects, projectsText }, skills] = await Promise.all([
    import("../data/projects"),
    loadSkillsSources(locale),
  ]);
  return { projects, projectsText, registry: buildSkillRegistry(skills, locale) };
}

export async function loadResumeSources(locale: Locale): Promise<ResumeSources> {
  const [projects, skills, resume] = await Promise.all([
    loadProjectsSources(locale),
    loadSkillsSources(locale),
    loadTexts(textResume, "resume", locale),
  ]);
  return { ...projects, ...skills, resume };
}
