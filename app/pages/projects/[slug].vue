<template>
  <ProjectCase
    v-if="blocks"
    :blocks="blocks"
    :data-atom-async="asyncKey"
  />
</template>

<script setup lang="ts">
import { createError, useAsyncData, useRoute, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import { Route } from "~/assets/const";
import { $metrika } from "~/assets/metrika";
import type { ProjectCaseHeaderData } from "~/assets/api/types/projectCase";
import ProjectCase from "~/components/pages/projects/ProjectCase/ProjectCase.vue";
import { useLocale } from "~/composables/useLocale";
import {
  breadcrumbNode,
  caseNode,
  personRef,
  useSiteUrls,
  useStructuredData,
} from "~/composables/useStructuredData";

const { t } = useI18n();
const { locale } = useLocale();
const site = useSiteUrls();
const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `project-case-${slug}`;
const { data } = await useAsyncData(asyncKey, async () => {
  const [blocks, person] = await Promise.all([
    $api.projects.fetchCase(slug),
    $api.profile.fetchPerson(),
  ]);
  return { blocks, person };
});
const blocks = computed(() => data.value?.blocks);

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });

$metrika.projects.viewCase(slug);

const header = computed(
  () =>
    blocks.value?.find((block) => block.component === "ProjectCaseHeader")?.data as
      ProjectCaseHeaderData | undefined,
);

const title = () =>
  t("seo.project.title", { project: header.value?.name, author: data.value?.person.name });
const description = () => header.value?.description;

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: "article" });

useStructuredData(() => {
  const project = header.value;
  const person = data.value?.person;
  if (!project || !person) return [];
  const url = site.page(Route.project(slug));
  return [
    caseNode(
      {
        name: project.name,
        description: project.description,
        url,
        projectUrl: project.url,
        language: locale.value,
      },
      personRef(person, site),
    ),
    breadcrumbNode([
      { name: t("nav.home"), url: site.page(Route.home) },
      { name: t("nav.projects"), url: site.page(Route.projects) },
      { name: project.name, url },
    ]),
  ];
});
</script>
