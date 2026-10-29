import type { ProfilePerson, ResumeProfile } from "../../types/resume";
import type { PersonSources } from "../../types/catalog";
import { LOCALES, type Locale } from "../../../const/locale";
import { firstDefined, textLayers } from "./layers";
import { buildSkillGroups } from "./skills";

function fullName(profile: ResumeProfile): string {
  return `${profile.firstName} ${profile.lastName}`;
}

export function buildPerson(src: PersonSources, locale: Locale): ProfilePerson {
  const profile = firstDefined(textLayers(src.resume, locale), (layer) => layer.profile);
  if (!profile) throw new Error(`Resume profile for "${locale}" is missing`);
  const name = fullName(profile);
  const alternateNames = LOCALES.map((layer) => src.resume[layer]?.profile)
    .filter((other) => other !== undefined)
    .map(fullName)
    .concat(src.person.alternateNames)
    .filter((other, index, list) => other !== name && list.indexOf(other) === index);
  const skills = buildSkillGroups(src, locale)
    .filter((group) => group.terms)
    .flatMap((group) => group.skills.map((skill) => skill.name));
  return { name, alternateNames, role: profile.role, skills };
}
