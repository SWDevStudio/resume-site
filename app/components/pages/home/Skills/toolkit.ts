import type { SkillView } from "~/assets/api/types/catalog";

export interface ToolkitTyped {
  key: string;
  text: string;
  class: string;
}

export interface Toolkit {
  static: string[];
  typed: ToolkitTyped[];
  label: string;
  style: Record<string, string>;
}

export const TOOLKIT_STATIC_COUNT = 6;
export const TOOLKIT_TYPED_COUNT = 29;

export function buildToolkit(skills: SkillView[]): Toolkit {
  const names = skills.map((skill) => skill.name);
  const staticItems = names.slice(0, TOOLKIT_STATIC_COUNT);
  const typedTexts = names.slice(TOOLKIT_STATIC_COUNT, TOOLKIT_STATIC_COUNT + TOOLKIT_TYPED_COUNT);
  const lengths = typedTexts.map((text) => text.length);

  return {
    static: staticItems,
    typed: typedTexts.map((text, index) => ({
      key: `typed-${index}`,
      text,
      class: `home-skills-type-color-${index % 4}`,
    })),
    label: [...staticItems, ...typedTexts].join(", "),
    style: {
      "--home-skills-type-max": String(Math.max(0, ...lengths)),
      "--home-skills-type-first": String(lengths[0] ?? 0),
    },
  };
}
