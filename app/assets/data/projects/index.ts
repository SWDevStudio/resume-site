import type { ProjectCanon, ProjectsText } from "../../../../shared/types/catalog";
import type { Locale } from "../../const/locale";
import qwixit from "./qwixit";
import brendmart from "./brendmart";
import pineRidge from "./pine-ridge";
import { projectLabels } from "./labels";

export const projectDefinitions = [qwixit, brendmart, pineRidge];

export const projects = projectDefinitions.map(
  ({ text, ...project }) => project,
) satisfies ProjectCanon[];

function textFor(locale: Locale): ProjectsText {
  return {
    ...projectLabels[locale],
    items: Object.fromEntries(
      projectDefinitions.map((project) => [project.id, project.text[locale]]),
    ),
  };
}

export const projectsText = {
  ru: textFor("ru"),
  en: textFor("en"),
} satisfies Record<Locale, ProjectsText>;
