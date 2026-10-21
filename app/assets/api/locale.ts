import { tryUseNuxtApp } from "#imports";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "~/assets/const";

export function resolveLocale(): Locale {
  const current = tryUseNuxtApp()?.$i18n?.locale.value;
  return LOCALES.find((locale) => locale === current) ?? DEFAULT_LOCALE;
}
