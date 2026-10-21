import type {
  SkillCanon,
  SkillGroupView,
  SkillRegistry,
  SkillsSources,
  SkillsText,
} from "../../types/catalog";
import type { Locale } from "../../../app/assets/const/locale";
import { firstDefined, textLayers } from "./layers";

function skillName(layers: SkillsText[], id: string): string {
  const name = firstDefined(layers, (layer) => layer.skills[id]);
  if (name === undefined) throw new Error(`Skill "${id}" has no name`);
  return name;
}

function groupName(layers: SkillsText[], id: string): string {
  const name = firstDefined(layers, (layer) => layer.groups[id]);
  if (name === undefined) throw new Error(`Skill group "${id}" has no name`);
  return name;
}

export function buildSkillRegistry(src: SkillsSources, locale: Locale): SkillRegistry {
  const layers = textLayers(src.skillsText, locale);
  return Object.fromEntries(
    src.skills.skills.map((skill) => [
      skill.id,
      {
        name: skillName(layers, skill.id),
        ...(skill.label === undefined ? {} : { label: skill.label }),
      },
    ]),
  );
}

export function buildSkillGroups(src: SkillsSources, locale: Locale): SkillGroupView[] {
  const layers = textLayers(src.skillsText, locale);
  const canon = new Map<string, SkillCanon>(src.skills.skills.map((skill) => [skill.id, skill]));
  return src.skills.groups.map((group) => ({
    id: group.id,
    name: groupName(layers, group.id),
    terms: group.kind === "tech",
    skills: group.skills.map((id) => {
      const skill = canon.get(id);
      if (!skill)
        throw new Error(`Skill "${id}" of the group "${group.id}" is not in the registry`);
      const name = skillName(layers, id);
      return { id, name, label: skill.label ?? name };
    }),
  }));
}
