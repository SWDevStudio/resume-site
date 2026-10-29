<template>
  <Projects
    :projects="items"
    data-atom-async="projects"
  />
</template>

<script setup lang="ts">
import { useAsyncData, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import { $metrika } from "~/assets/metrika";
import Projects from "~/components/pages/projects/Projects/Projects.vue";
import { breadcrumbNode, useSiteUrls, useStructuredData } from "~/composables/useStructuredData";

const { t } = useI18n();
const site = useSiteUrls();

const { data } = await useAsyncData("projects", async () => {
  const [projects, person] = await Promise.all([
    $api.projects.fetchList(),
    $api.profile.fetchPerson(),
  ]);
  return { projects, person };
});
const items = computed(() => data.value?.projects ?? []);

const title = () => t("seo.projects.title", { name: data.value?.person.name ?? "" });
const description = () => t("seo.projects.description");

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

useStructuredData(() => [
  breadcrumbNode([
    { name: t("nav.home"), url: site.page(Route.home) },
    { name: t("nav.projects"), url: site.page(Route.projects) },
  ]),
]);

$metrika.projects.viewList();
</script>
