import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
      "#components": fileURLToPath(new URL("./test/stubs/nuxt-components.ts", import.meta.url)),
      "#imports": fileURLToPath(new URL("./test/stubs/nuxt-imports.ts", import.meta.url)),
    },
  },
  test: {
    include: ["app/**/*.view.test.ts", "shared/**/*.view.test.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1024, height: 768 },
    },
  },
});
