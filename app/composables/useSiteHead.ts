import { computed } from "vue";
import {
  useHead,
  useLocaleHead,
  useRoute,
  useRouteBaseName,
  useSafeRuntimeConfig,
  useSwitchLocalePath,
} from "#imports";
import { useI18n } from "vue-i18n";
import type { Link, Meta } from "@unhead/vue/types";
import { LOCALES, OG_LOCALE, THEME_COLOR, type Locale } from "~/assets/const";
import { useTheme } from "~/composables/useTheme";
import sharePhoto from "~/components/pages/home/About/media/photo.webp?w=460&as=img";

const SITE_NAME = "SOWA_DEV";
const FONT_ROOT = "/fonts/";
const HOME_ROUTE = "index";
const OG_LOCALE_PROPERTY = "og:locale";
const OG_URL_PROPERTY = "og:url";
const X_DEFAULT = "x-default";

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

function isNotOgLocale(meta: Meta) {
  return !String(meta.property ?? "").startsWith(OG_LOCALE_PROPERTY);
}

function ogLocaleMeta(current: Locale, alternates: readonly Locale[]): Meta[] {
  return [
    { key: "og-locale", property: OG_LOCALE_PROPERTY, content: OG_LOCALE[current] },
    ...alternates.map((locale) => ({
      key: `og-locale-alternate-${locale}`,
      property: `${OG_LOCALE_PROPERTY}:alternate`,
      content: OG_LOCALE[locale],
    })),
  ];
}

function singleLocaleLinks(url: string, locale: Locale): Link[] {
  return [
    { key: "i18n-xd", rel: "alternate", hreflang: X_DEFAULT, href: url },
    { key: `i18n-alt-${locale}`, rel: "alternate", hreflang: locale, href: url },
    { key: "i18n-can", rel: "canonical", href: url },
  ];
}

function withOgUrl(meta: Meta[], url: string): Meta[] {
  return meta.map((item) => (item.property === OG_URL_PROPERTY ? { ...item, content: url } : item));
}

function verificationMeta(tokens: Record<string, string>): Meta[] {
  return Object.entries(tokens)
    .filter(([, content]) => content !== "")
    .map(([name, content]) => ({ name, content }));
}

function titleTemplate(title?: string) {
  return title || SITE_NAME;
}

export function useSiteHead() {
  const { t, locale } = useI18n();
  const { current } = useTheme();
  const runtimeConfig = useSafeRuntimeConfig();
  const { baseUrl } = runtimeConfig.public.i18n;
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  const localeHead = useLocaleHead({ seo: Boolean(baseUrl) });
  const canonicalLocale = computed(() =>
    LOCALES.find((code) => code === route.meta.canonicalLocale),
  );
  const seoHead = computed(() => {
    const head = localeHead.value;
    const target = canonicalLocale.value;
    if (!target || !baseUrl) return head;
    const url = `${baseUrl}${switchLocalePath(target)}`;
    return { ...head, link: singleLocaleLinks(url, target), meta: withOgUrl(head.meta, url) };
  });
  const ogLocale = computed(() => {
    const target = canonicalLocale.value;
    if (target) return ogLocaleMeta(target, []);
    return ogLocaleMeta(
      locale.value,
      LOCALES.filter((code) => code !== locale.value),
    );
  });
  const themeColor = computed(() => THEME_COLOR[current.value]);
  const verification = verificationMeta({
    "yandex-verification": runtimeConfig.public.yandexVerification,
    "google-site-verification": runtimeConfig.public.googleSiteVerification,
  });

  if (import.meta.server) {
    const fonts = FONT_PRELOADS[locale.value];
    const files = useRouteBaseName()(route) === HOME_ROUTE ? fonts.home : fonts.page;
    useHead({ link: files.map(fontPreload) });
  }

  useHead(() => ({
    htmlAttrs: seoHead.value.htmlAttrs,
    link: seoHead.value.link,
    titleTemplate,
    meta: [
      ...seoHead.value.meta.filter(isNotOgLocale),
      ...ogLocale.value,
      ...verification,
      { name: "description", content: t("seo.home.description") },
      { name: "theme-color", content: themeColor.value },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:description", content: t("seo.home.description") },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${baseUrl}${sharePhoto.src}` },
      { property: "og:image:width", content: String(sharePhoto.w) },
      { property: "og:image:height", content: String(sharePhoto.h) },
      { property: "og:image:alt", content: t("home.about.photoAlt") },
      { name: "twitter:card", content: "summary" },
    ],
  }));
}
