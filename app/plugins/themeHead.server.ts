import { defineNuxtPlugin, useHead } from "#imports";
import { THEME_HEAD_SCRIPT } from "~/utils/themeHeadScript";

export default defineNuxtPlugin(() => {
  useHead({
    script: [{ key: "theme-head", innerHTML: THEME_HEAD_SCRIPT, tagPriority: "critical" }],
  });
});
