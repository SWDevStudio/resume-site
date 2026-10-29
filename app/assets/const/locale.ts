export const LOCALES = ["ru", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const POST_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "locale";

export const OG_LOCALE: Record<Locale, string> = {
  ru: "ru_RU",
  en: "en_US",
};
