import capacitorIcon from "./icons/capacitor.webp";
import cssIcon from "./icons/css3.webp";
import dockerIcon from "./icons/docker.webp";
import figmaIcon from "./icons/figma.webp";
import ghActionsIcon from "./icons/gh-actions.webp";
import gitIcon from "./icons/git.webp";
import gitLabIcon from "./icons/git-lab.webp";
import graphQlIcon from "./icons/graph-ql.webp";
import htmlIcon from "./icons/html5.webp";
import javaScriptIcon from "./icons/java-script.webp";
import jestIcon from "./icons/jest.webp";
import jiraIcon from "./icons/jira.webp";
import laravelIcon from "./icons/laravel.webp";
import nextJsIcon from "./icons/next-js.webp";
import nodeJsIcon from "./icons/node-js.webp";
import nuxtIcon from "./icons/nuxt.webp";
import postgreSqlIcon from "./icons/postgre-sql.webp";
import prometheusIcon from "./icons/prometheus.webp";
import reactIcon from "./icons/react.webp";
import reduxIcon from "./icons/redux.webp";
import rustIcon from "./icons/rust.webp";
import sassIcon from "./icons/sass.webp";
import storybookIcon from "./icons/storybook.webp";
import tailwindIcon from "./icons/tailwind.webp";
import tauriIcon from "./icons/tauri.webp";
import typeScriptIcon from "./icons/type-script.webp";
import viteIcon from "./icons/vite.webp";
import vitestIcon from "./icons/vitest.webp";
import vueIcon from "./icons/vue.webp";
import webpackIcon from "./icons/webpack.webp";

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
  Redux = "Redux",
  Storybook = "Storybook",
  Vite = "Vite",
  Vitest = "Vitest",
  Jest = "Jest",
  Sass = "Sass",
  Webpack = "Webpack",
  Figma = "Figma",
  Capacitor = "Capacitor",
  GraphQl = "GraphQl",
  Prometheus = "Prometheus",
  Jira = "Jira",
  Tauri = "Tauri",
  GitLab = "GitLab",
  Git = "Git",
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
  [SkillTile.Redux]: { label: "Redux", icon: reduxIcon },
  [SkillTile.Storybook]: { label: "Storybook", icon: storybookIcon },
  [SkillTile.Vite]: { label: "Vite", icon: viteIcon },
  [SkillTile.Vitest]: { label: "Vitest", icon: vitestIcon },
  [SkillTile.Jest]: { label: "Jest", icon: jestIcon },
  [SkillTile.Sass]: { label: "Sass", icon: sassIcon },
  [SkillTile.Webpack]: { label: "Webpack", icon: webpackIcon },
  [SkillTile.Figma]: { label: "Figma", icon: figmaIcon },
  [SkillTile.Capacitor]: { label: "Capacitor", icon: capacitorIcon },
  [SkillTile.GraphQl]: { label: "GraphQL", icon: graphQlIcon },
  [SkillTile.Prometheus]: { label: "Prometheus", icon: prometheusIcon },
  [SkillTile.Jira]: { label: "Jira", icon: jiraIcon },
  [SkillTile.Tauri]: { label: "Tauri", icon: tauriIcon },
  [SkillTile.GitLab]: { label: "GitLab", icon: gitLabIcon },
  [SkillTile.Git]: { label: "Git", icon: gitIcon },
};
