import cssIcon from "./icons/css3.webp";
import dockerIcon from "./icons/docker.webp";
import ghActionsIcon from "./icons/gh-actions.webp";
import htmlIcon from "./icons/html5.webp";
import javaScriptIcon from "./icons/java-script.webp";
import laravelIcon from "./icons/laravel.webp";
import nextJsIcon from "./icons/next-js.webp";
import nodeJsIcon from "./icons/node-js.webp";
import nuxtIcon from "./icons/nuxt.webp";
import postgreSqlIcon from "./icons/postgre-sql.webp";
import reactIcon from "./icons/react.webp";
import rustIcon from "./icons/rust.webp";
import tailwindIcon from "./icons/tailwind.webp";
import typeScriptIcon from "./icons/type-script.webp";
import vueIcon from "./icons/vue.webp";

export enum SkillTile {
  React = "React",
  NextJs = "NextJs",
  Vue = "Vue",
  Nuxt = "Nuxt",
  TypeScript = "TypeScript",
  Tailwind = "Tailwind",
  JavaScript = "JavaScript",
  Html5 = "Html5",
  Css3 = "Css3",
  NodeJs = "NodeJs",
  PostgreSql = "PostgreSql",
  Laravel = "Laravel",
  Rust = "Rust",
  Docker = "Docker",
  GhActions = "GhActions",
}

export interface SkillTileMeta {
  label: string;
  icon: string;
  full?: boolean;
  mono?: boolean;
}

export const SKILL_TILE_META: Record<SkillTile, SkillTileMeta> = {
  [SkillTile.React]: { label: "React", icon: reactIcon },
  [SkillTile.NextJs]: { label: "Next.js", icon: nextJsIcon, mono: true },
  [SkillTile.Vue]: { label: "Vue", icon: vueIcon },
  [SkillTile.Nuxt]: { label: "Nuxt", icon: nuxtIcon },
  [SkillTile.TypeScript]: { label: "TypeScript", icon: typeScriptIcon, full: true },
  [SkillTile.Tailwind]: { label: "Tailwind", icon: tailwindIcon },
  [SkillTile.JavaScript]: { label: "JavaScript", icon: javaScriptIcon },
  [SkillTile.Html5]: { label: "HTML5", icon: htmlIcon },
  [SkillTile.Css3]: { label: "CSS3", icon: cssIcon },
  [SkillTile.NodeJs]: { label: "Node.js", icon: nodeJsIcon },
  [SkillTile.PostgreSql]: { label: "PostgreSQL", icon: postgreSqlIcon },
  [SkillTile.Laravel]: { label: "Laravel", icon: laravelIcon },
  [SkillTile.Rust]: { label: "Rust", icon: rustIcon, full: true },
  [SkillTile.Docker]: { label: "Docker", icon: dockerIcon, full: true },
  [SkillTile.GhActions]: { label: "GH Actions", icon: ghActionsIcon },
};
