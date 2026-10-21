import type { SkillGroupView, SkillRegistry, SkillsSources, SkillsText } from "../../types/catalog";
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
    src.skills.groups
      .flatMap((group) => group.skills)
      .map((skill) => [
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
  return src.skills.groups.map((group) => ({
    id: group.id,
    name: groupName(layers, group.id),
    terms: group.kind === "tech",
    skills: group.skills.map((skill) => {
      const { id } = skill;
      const name = skillName(layers, id);
      return { id, name, label: skill.label ?? name };
    }),
  }));
}
