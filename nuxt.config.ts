// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./app/assets/const/locale";
import { Route } from "./app/assets/const/route";

const FILE_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

const fileRules = Object.fromEntries(
  LOCALES.flatMap((locale) => [Route.resumePdf(locale), Route.resumeMarkdown(locale)]).map(
    (path) => [path, { headers: { "cache-control": FILE_CACHE } }],
  ),
);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@vueuse/nuxt", "@nuxtjs/i18n", "nuxt-safe-runtime-config"],
  imports: {
    autoImport: false,
  },
  components: false,
  runtimeConfig: {
    assistant: {
      groqKey: "",
      cloudflareAccountId: "",
      cloudflareToken: "",
      openrouterKey: "",
      githubToken: "",
      secret: "",
    },
  },
  safeRuntimeConfig: {
    $schema: "./server/runtimeConfig.schema",
    validateAtRuntime: false,
    validateAtBuild: false,
  },
  app: {
    head: {
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  vueuse: {
    ssrHandlers: true,
  },
  css: ["~/assets/css/fonts.css", "~/assets/css/main.css"],
  i18n: {
    restructureDir: "app",
    langDir: "locales",
    locales: LOCALES.map((code) => ({ code, language: code, file: `${code}.json` })),
    defaultLocale: DEFAULT_LOCALE,
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LOCALE_COOKIE,
      redirectOn: "no prefix",
      fallbackLocale: DEFAULT_LOCALE,
    },
  },
  nitro: {
    routeRules: fileRules,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  $production: {
    ignore: ["**/pages/ui.vue", "**/pages/ui/**"],
  },
});
