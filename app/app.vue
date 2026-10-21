<script setup lang="ts">
import { NuxtLayout, NuxtPage, NuxtRouteAnnouncer } from "#components";
import { computed } from "vue";
import { useHead } from "#imports";
import { THEME_COLOR } from "~/assets/const";
import { useLocale } from "~/composables/useLocale";
import { useTheme } from "~/composables/useTheme";

const { current } = useTheme();
const { locale } = useLocale();
const themeColor = computed(() => THEME_COLOR[current.value]);
useHead({
  htmlAttrs: { lang: locale },
  meta: [{ name: "theme-color", content: themeColor }],
});
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
