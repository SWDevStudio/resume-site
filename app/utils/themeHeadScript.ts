import { THEME, THEME_COLOR, THEME_STORAGE_KEY, type ThemeId } from "~/assets/const";

type ThemeMode = keyof typeof THEME;

interface ThemeHeadConfig {
  cookieName: string;
  themes: Record<ThemeMode, ThemeId>;
  colors: Record<ThemeId, string>;
}

function applyStoredTheme(doc: Document, config: ThemeHeadConfig): void {
  function readCookie(name: string): string {
    const prefix = `${name}=`;
    let value = "";
    for (const entry of doc.cookie.split(/; */)) {
      if (entry.startsWith(prefix)) value = entry.slice(prefix.length);
    }
    return value;
  }

  function decodeValue(raw: string): string {
    try {
      return decodeURIComponent(raw).replace(/^"|"$/g, "");
    } catch {
      return raw;
    }
  }

  function isThemeMode(value: string): value is ThemeMode {
    return Object.prototype.hasOwnProperty.call(config.themes, value);
  }

  function resolveMode(stored: string): ThemeMode {
    if (isThemeMode(stored)) return stored;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyMetaColor(theme: ThemeId): void {
    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", config.colors[theme]);
  }

  try {
    const theme = config.themes[resolveMode(decodeValue(readCookie(config.cookieName)))];
    doc.documentElement.setAttribute("data-theme", theme);
    doc.addEventListener("DOMContentLoaded", () => applyMetaColor(theme));
  } catch {
    return;
  }
}

const config: ThemeHeadConfig = {
  cookieName: THEME_STORAGE_KEY,
  themes: THEME,
  colors: THEME_COLOR,
};

export const THEME_HEAD_SCRIPT = `(${applyStoredTheme})(document,${JSON.stringify(config)})`;
