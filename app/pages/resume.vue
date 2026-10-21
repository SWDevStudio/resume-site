<template>
  <Resume
    v-if="data"
    :data="data"
    data-atom-async="resume"
  />
</template>

<script setup lang="ts">
import { useAsyncData, useHead } from "#imports";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import Resume from "~/components/pages/resume/Resume/Resume.vue";
import { useLocale } from "~/composables/useLocale";

const { locale } = useLocale();
const { data } = await useAsyncData("resume", () => $api.profile.fetchResume());

useHead(() => ({
  link: [
    {
      rel: "alternate",
      type: "text/markdown",
      href: Route.resumeMarkdown(locale.value),
      hreflang: locale.value,
    },
  ],
}));
</script>
