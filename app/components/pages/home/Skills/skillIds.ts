import type { SkillTile } from "~/components/ui/UiSkillTile/skillTile";

export function kebab(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function skillTileId(tile: SkillTile) {
  return kebab(tile);
}
