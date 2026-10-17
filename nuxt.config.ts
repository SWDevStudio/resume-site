// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@vueuse/nuxt"],
  imports: {
    autoImport: false,
  },
  components: false,
  vueuse: {
    ssrHandlers: true,
  },
  css: ["~/assets/css/fonts.css", "~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  $production: {
    ignore: ["**/pages/ui.vue", "**/pages/ui/**"],
  },
});
