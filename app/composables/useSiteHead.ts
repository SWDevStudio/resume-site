import { computed } from "vue";
import { useHead, useLocaleHead, useSafeRuntimeConfig } from "#imports";
import { useI18n } from "vue-i18n";
import { THEME_COLOR } from "~/assets/const";
import { useTheme } from "~/composables/useTheme";

const SITE_NAME = "SOWA_DEV";

function titleTemplate(title?: string) {
  return title ? `${title} · ${SITE_NAME}` : SITE_NAME;
}

export function useSiteHead() {
  const { t } = useI18n();
  const { current } = useTheme();
  const runtimeConfig = useSafeRuntimeConfig();
  const localeHead = useLocaleHead({ seo: Boolean(runtimeConfig.public.i18n.baseUrl) });
  const themeColor = computed(() => THEME_COLOR[current.value]);

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
