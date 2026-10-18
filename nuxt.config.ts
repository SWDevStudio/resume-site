// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./app/assets/const/locale";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@vueuse/nuxt", "@nuxtjs/i18n"],
  imports: {
    autoImport: false,
  },
  components: false,
  vueuse: {
    ssrHandlers: true,
  },
  css: ["~/assets/css/fonts.css", "~/assets/css/main.css"],
  i18n: {
    restructureDir: "app",
    langDir: "locales",
    locales: LOCALES.map((code) => ({ code, file: `${code}.json` })),
    defaultLocale: DEFAULT_LOCALE,
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LOCALE_COOKIE,
      redirectOn: "no prefix",
      fallbackLocale: DEFAULT_LOCALE,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  $production: {
    ignore: ["**/pages/ui.vue", "**/pages/ui/**"],
  },
});
