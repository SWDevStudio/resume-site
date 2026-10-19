import { DEFAULT_THEME, THEMES, type ThemeId } from "~/assets/const";

export const UI_ICONS = [
  "arrow-down",
  "arrow-right",
  "arrow-send",
  "arrow-up",
  "chat",
  "code",
  "email",
  "external",
  "spinner",
  "telegram",
] as const;

export type UiIconName = (typeof UI_ICONS)[number];

const files = import.meta.glob<string>("./packs/*/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

const packs: Record<string, Record<string, string>> = {};

for (const [path, url] of Object.entries(files)) {
  const match = /\/packs\/([^/]+)\/([^/]+)\.svg$/.exec(path);
  if (!match) continue;
  const [, theme = "", name = ""] = match;
  (packs[theme] ??= {})[name] = url;
}

function resolve(theme: ThemeId, name: string) {
  return packs[theme]?.[name] ?? packs[DEFAULT_THEME]?.[name] ?? "";
}

export function iconVars(name: UiIconName) {
  return Object.fromEntries(
    THEMES.map((theme) => [`--ui-icon-${theme}`, `url("${resolve(theme, name)}")`]),
  );
}
