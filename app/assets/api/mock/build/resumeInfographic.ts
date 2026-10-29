import type { ResumeInfographicSources } from "../../types/catalog";
import type { ResumeInfographic } from "../../types/resumeInfographic";
import type { Locale } from "../../../const/locale";
import { firstDefined, textLayers } from "./layers";

export function buildResumeInfographic(
  src: ResumeInfographicSources,
  locale: Locale,
): ResumeInfographic {
  const resume = firstDefined(textLayers(src.resume, locale), (layer) => layer);
  const infographic = firstDefined(textLayers(src.resumeInfographic, locale), (layer) => layer);
  if (!resume || !infographic) throw new Error(`Resume infographic for "${locale}" is missing`);
  return {
    ...infographic,
    name: `${resume.profile.firstName} ${resume.profile.lastName}`,
    ai: { ...infographic.ai, link: resume.ai.link },
  };
}
