<template>
  <Resume
    v-if="data"
    :data="data"
    data-atom-async="resume"
  />
</template>

<script setup lang="ts">
import { useAsyncData, useHead, useSeoMeta } from "#imports";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import Resume from "~/components/pages/resume/Resume/Resume.vue";
import { useLocale } from "~/composables/useLocale";

const { t } = useI18n();
const { locale } = useLocale();
const { data } = await useAsyncData("resume", () => $api.profile.fetchResume());

const title = () => t("seo.resume.title");
const description = () => t("seo.resume.description");

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

useHead(() => ({
  link: [
    {
      rel: "alternate",
      type: "text/markdown",
      href: Route.resumeMarkdown(locale.value),
    },
  ],
}));
</script>
