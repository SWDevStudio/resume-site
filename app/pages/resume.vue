<template>
  <Resume
    v-if="resume"
    :data="resume"
    data-atom-async="resume"
  />
</template>

<script setup lang="ts">
import { useAsyncData, useHead, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import Resume from "~/components/pages/resume/Resume/Resume.vue";
import { useLocale } from "~/composables/useLocale";
import {
  breadcrumbNode,
  profilePageNode,
  useSiteUrls,
  useStructuredData,
} from "~/composables/useStructuredData";

const { t } = useI18n();
const { locale } = useLocale();
const site = useSiteUrls();
const { data } = await useAsyncData("resume", async () => {
  const [resume, person] = await Promise.all([
    $api.profile.fetchResume(),
    $api.profile.fetchPerson(),
  ]);
  return { resume, person };
});
const resume = computed(() => data.value?.resume);

const name = computed(() => data.value?.person.name ?? "");
const title = () => t("seo.resume.title", { name: name.value });
const description = () => t("seo.resume.description", { name: name.value });

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: "profile" });

useHead(() => ({
  link: [
    {
      rel: "alternate",
      type: "text/markdown",
      href: Route.resumeMarkdown(locale.value),
    },
  ],
}));

useStructuredData(() => {
  const person = data.value?.person;
  if (!person) return [];
  const url = site.page(Route.resume);
  return [
    profilePageNode(person, site, url, locale.value),
    breadcrumbNode([
      { name: t("nav.home"), url: site.page(Route.home) },
      { name: t("nav.resume"), url },
    ]),
  ];
});
</script>
