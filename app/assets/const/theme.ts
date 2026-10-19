export const THEME = {
  light: "torii-synth",
  dark: "cyber-sakura",
} as const;

export type ThemeId = (typeof THEME)[keyof typeof THEME];

export const THEMES: readonly ThemeId[] = Object.values(THEME);

export const DEFAULT_THEME: ThemeId = THEME.light;
