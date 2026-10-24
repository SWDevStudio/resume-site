import type { SkillRegistry, StackRef } from "../../types/catalog";

export function resolveStack(refs: StackRef[], registry: SkillRegistry = {}): string[] {
  return refs.map((ref) => {
    if (typeof ref !== "string") return ref.label;
    const entry = registry[ref];
    const name = entry?.label ?? entry?.name;
    if (name === undefined)
      throw new Error(`Stack reference "${ref}" is not in the skill registry`);
    return name;
  });
}
