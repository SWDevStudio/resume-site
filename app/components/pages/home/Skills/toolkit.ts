import type { SkillView } from "~/assets/api/types/catalog";

export interface ToolkitTyped {
  key: string;
  text: string;
  class: string;
  style: Record<string, string>;
}

export interface Toolkit {
  static: string[];
  typed: ToolkitTyped[];
  label: string;
}

export const TOOLKIT_STATIC_COUNT = 6;
export const TOOLKIT_TYPED_COUNT = 29;

export function buildToolkit(skills: SkillView[]): Toolkit {
  const names = skills.map((skill) => skill.name);
  const staticItems = names.slice(0, TOOLKIT_STATIC_COUNT);
  const typedTexts = names.slice(TOOLKIT_STATIC_COUNT, TOOLKIT_STATIC_COUNT + TOOLKIT_TYPED_COUNT);

  return {
    static: staticItems,
    typed: typedTexts.map((text, index) => ({
      key: `typed-${index}`,
      text,
      class: `home-skills-type-color-${index % 4}${index === 0 ? " home-skills-type-first" : ""}`,
      style: { "--home-skills-type": `home-skills-type-${index}` },
    })),
    label: [...staticItems, ...typedTexts].join(", "),
  };
}
