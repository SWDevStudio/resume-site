import type { ProjectCanon, ProjectsText } from "../../api/types/catalog";
import type { Locale } from "../../const/locale";
import qwixit from "./qwixit";
import brendmart from "./brendmart";
import taobao from "./taobao";
import pochtoyProstobox from "./pochtoy-prostobox";
import cdekShopping from "./cdek-shopping";
import flyPost from "./fly-post";
import tamrielCodex from "./tamriel-codex";
import someday from "./someday";
import dobro from "./dobro";
import hector from "./hector";
import { projectLabels } from "./labels";

export const projectDefinitions = [
  qwixit,
  brendmart,
  taobao,
  pochtoyProstobox,
  cdekShopping,
  flyPost,
  tamrielCodex,
  someday,
  dobro,
  hector,
];

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
