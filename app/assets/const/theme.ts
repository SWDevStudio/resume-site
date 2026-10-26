export const THEME = {
  dark: "torii-synth",
  light: "cyber-sakura",
} as const;

export type ThemeId = (typeof THEME)[keyof typeof THEME];

export const THEMES: readonly ThemeId[] = Object.values(THEME);

export const DEFAULT_THEME: ThemeId = THEME.dark;

export const THEME_STORAGE_KEY = "vueuse-color-scheme";

export const THEME_COLOR: Record<ThemeId, string> = {
  "torii-synth": "#09090C",
  "cyber-sakura": "#F4F0F8",
};
