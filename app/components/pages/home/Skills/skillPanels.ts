import { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import type { SkillGroupView } from "~/assets/api/types/catalog";
import type { SkillGroupId } from "~/assets/api/types/resume";
import { skillTileId } from "./skillIds";
import { skillWavePhases } from "./skillWave";

export interface SkillPanelTileSource {
  skill: SkillTile;
  swap: SkillTile;
  class?: string;
}

export interface SkillPanelTile extends SkillPanelTileSource {
  phase: number;
}

interface SkillPanelSource {
  key: Extract<SkillGroupId, "frontend" | "backend">;
  index: string;
  class?: string;
  tiles: SkillPanelTileSource[];
}

export interface SkillPanel extends Omit<SkillPanelSource, "tiles"> {
  tiles: SkillPanelTile[];
}

export interface SkillPanels {
  panels: SkillPanel[];
  steps: number;
}

export const skillPanelSources: SkillPanelSource[] = [
  {
    key: "frontend",
    index: "01",
    tiles: [
      { skill: SkillTile.React, swap: SkillTile.Redux },
      { skill: SkillTile.NextJs, swap: SkillTile.Storybook },
      { skill: SkillTile.Vue, swap: SkillTile.Vite },
      { skill: SkillTile.Nuxt, swap: SkillTile.Vitest },
      { skill: SkillTile.TypeScript, swap: SkillTile.Jest },
      { skill: SkillTile.Tailwind, swap: SkillTile.Sass },
      {
        skill: SkillTile.JavaScript,
        swap: SkillTile.Webpack,
        class: "home-skills-tile-wide",
      },
      {
        skill: SkillTile.Html5,
        swap: SkillTile.Figma,
        class: "home-skills-tile-wide",
      },
      {
        skill: SkillTile.Css3,
        swap: SkillTile.Capacitor,
        class: "home-skills-tile-wide",
      },
    ],
  },
  {
    key: "backend",
    index: "02",
    class: "home-skills-panel-accent",
    tiles: [
      { skill: SkillTile.NodeJs, swap: SkillTile.GraphQl },
      { skill: SkillTile.PostgreSql, swap: SkillTile.Prometheus },
      { skill: SkillTile.Laravel, swap: SkillTile.Jira },
      { skill: SkillTile.Rust, swap: SkillTile.Tauri },
      { skill: SkillTile.Docker, swap: SkillTile.GitLab },
      { skill: SkillTile.GhActions, swap: SkillTile.Git },
      {
        skill: SkillTile.NestJs,
        swap: SkillTile.NestJs,
        class: "home-skills-tile-wide",
      },
      {
        skill: SkillTile.Nginx,
        swap: SkillTile.Nginx,
        class: "home-skills-tile-wide",
      },
      {
        skill: SkillTile.Redis,
        swap: SkillTile.Redis,
        class: "home-skills-tile-wide",
      },
    ],
  },
];

export function buildSkillPanels(groups: SkillGroupView[]): SkillPanels {
  const known = new Set(groups.flatMap((group) => group.skills.map((skill) => skill.id)));

  const sources = skillPanelSources.map((panel) => {
    const own = new Set(
      groups.find((group) => group.id === panel.key)?.skills.map((skill) => skill.id),
    );
    const tiles = panel.tiles
      .filter((tile) => own.has(skillTileId(tile.skill)))
      .map((tile) => (known.has(skillTileId(tile.swap)) ? tile : { ...tile, swap: tile.skill }));
    return { ...panel, tiles };
  });

  const sizes = sources.map((panel) => panel.tiles.length);
  const phases = skillWavePhases(sizes);

  return {
    steps: sizes.reduce((sum, size) => sum + size, 0),
    panels: sources.map((panel, panelIndex) => ({
      ...panel,
      tiles: panel.tiles.map((tile, tileIndex) => ({
        ...tile,
        phase: phases[panelIndex]![tileIndex]!,
      })),
    })),
  };
}
