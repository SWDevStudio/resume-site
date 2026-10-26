// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { responsiveImages } from "./imagetools.config";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "./app/assets/const/locale";
import { Route } from "./app/assets/const/route";

const FILE_CACHE = "public, max-age=3600, stale-while-revalidate=86400";
const FONT_CACHE = "public, max-age=31536000, immutable";
const SKILL_ICON_RE = /\/UiSkillTile\/icons\/[^/]+\.webp$/;
const NO_PREFETCH_SOURCES = [
  "components/ui/UiModal/",
  "components/pages/home/Contact/ContactForm.vue",
];

const fileRules = Object.fromEntries(
  LOCALES.flatMap((locale) => [
    [
      Route.resumePdf(locale),
      {
        prerender: true,
        headers: {
          "cache-control": FILE_CACHE,
          "content-disposition": `attachment; filename="resume-${locale}.pdf"`,
        },
      },
    ],
    [Route.resumeMarkdown(locale), { prerender: true, headers: { "cache-control": FILE_CACHE } }],
  ]),
);

const pageRules = Object.fromEntries(
  LOCALES.flatMap((locale) => [`/${locale}`, `/${locale}/**`]).map((path) => [
    path,
    { prerender: true },
  ]),
);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@vueuse/nuxt", "@nuxtjs/i18n", "nuxt-safe-runtime-config"],
  imports: {
    autoImport: false,
    scan: false,
  },
  components: false,
  features: {
    inlineStyles: false,
  },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { visibility: false, interaction: true },
      },
    },
  },
  runtimeConfig: {
    assistant: {
      groqKey: "",
      cloudflareAccountId: "",
      cloudflareToken: "",
      openrouterKey: "",
      githubToken: "",
      secret: "",
    },
    public: {
      yandexMetrikaId: "",
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
  routeRules: {
    [Route.home]: { prerender: false },
    ...pageRules,
    ...fileRules,
    "/fonts/**": { headers: { "cache-control": FONT_CACHE } },
    "/api/**": { headers: { "cache-control": "no-store" } },
  },
  prerender: {
    crawlLinks: true,
  },
  nitro: {
    compressPublicAssets: true,
    storage: {
      assistant: { driver: "fs", base: "./.data/assistant" },
    },
  },
  vite: {
    plugins: [tailwindcss(), responsiveImages()],
    build: {
      assetsInlineLimit: (file) => (SKILL_ICON_RE.test(file) ? false : undefined),
    },
  },
  hooks: {
    "build:manifest"(manifest) {
      for (const meta of Object.values(manifest)) {
        if (meta.resourceType === "image") meta.prefetch = false;
      }
      const seen = new Set<string>();
      const skipPrefetch = (id: string) => {
        const meta = manifest[id];
        if (!meta || meta.isEntry || seen.has(id)) return;
        seen.add(id);
        meta.prefetch = false;
        for (const css of meta.css ?? []) {
          const style = manifest[css];
          if (style) style.prefetch = false;
        }
        for (const dependency of meta.imports ?? []) skipPrefetch(dependency);
      };
      for (const [id, meta] of Object.entries(manifest)) {
        if (meta.isDynamicEntry && NO_PREFETCH_SOURCES.some((source) => id.startsWith(source)))
          skipPrefetch(id);
      }
    },
  },
  $production: {
    ignore: ["**/pages/ui.vue", "**/pages/ui/**"],
  },
});
