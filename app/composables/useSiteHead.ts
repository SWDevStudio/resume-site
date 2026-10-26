import { computed } from "vue";
import { useHead, useLocaleHead, useRoute, useRouteBaseName, useSafeRuntimeConfig } from "#imports";
import { useI18n } from "vue-i18n";
import type { Link } from "@unhead/vue/types";
import { THEME_COLOR, type Locale } from "~/assets/const";
import { useTheme } from "~/composables/useTheme";

const SITE_NAME = "SOWA_DEV";
const FONT_ROOT = "/fonts/";
const HOME_ROUTE = "index";

const MARTIAN_LATIN = "martian-mono-100-800-latin.woff2";
const MARTIAN_CYRILLIC = "martian-mono-100-800-cyrillic.woff2";
const MONTSERRAT_CYRILLIC = "montserrat-alternates-700-cyrillic.woff2";
const MONTSERRAT_LATIN = "montserrat-alternates-700-latin.woff2";
const RIGHTEOUS = "righteous-400-latin.woff2";

const EN_FONTS = [MARTIAN_LATIN, RIGHTEOUS];

const FONT_PRELOADS: Record<Locale, { home: string[]; page: string[] }> = {
  en: { home: EN_FONTS, page: EN_FONTS },
  ru: {
    home: [MARTIAN_LATIN, MARTIAN_CYRILLIC, RIGHTEOUS],
    page: [MARTIAN_LATIN, MARTIAN_CYRILLIC, MONTSERRAT_CYRILLIC, MONTSERRAT_LATIN, RIGHTEOUS],
  },
};

function fontPreload(file: string): Link {
  return {
    key: `font-${file}`,
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: `${FONT_ROOT}${file}`,
    crossorigin: "anonymous",
  };
}

function titleTemplate(title?: string) {
  return title ? `${title} · ${SITE_NAME}` : SITE_NAME;
}

export function useSiteHead() {
  const { t, locale } = useI18n();
  const { current } = useTheme();
  const runtimeConfig = useSafeRuntimeConfig();
  const localeHead = useLocaleHead({ seo: Boolean(runtimeConfig.public.i18n.baseUrl) });
  const themeColor = computed(() => THEME_COLOR[current.value]);

  if (import.meta.server) {
    const fonts = FONT_PRELOADS[locale.value];
    const files = useRouteBaseName()(useRoute()) === HOME_ROUTE ? fonts.home : fonts.page;
    useHead({ link: files.map(fontPreload) });
  }

  useHead(() => ({
    htmlAttrs: localeHead.value.htmlAttrs,
    link: localeHead.value.link,
    titleTemplate,
    meta: [
      ...localeHead.value.meta,
      { name: "description", content: t("seo.home.description") },
      { name: "theme-color", content: themeColor.value },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:description", content: t("seo.home.description") },
      { property: "og:type", content: "website" },
    ],
  }));
}
