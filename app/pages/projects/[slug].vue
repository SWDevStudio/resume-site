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
import { $api } from "~/assets/api";
import { $metrika } from "~/assets/metrika";
import type { ProjectCaseHeaderData } from "~/assets/api/types/projectCase";
import ProjectCase from "~/components/pages/projects/ProjectCase/ProjectCase.vue";

const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `project-case-${slug}`;
const { data: blocks } = await useAsyncData(asyncKey, () => $api.projects.fetchCase(slug));

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });

$metrika.projects.viewCase(slug);

const header = computed(
  () =>
    blocks.value?.find((block) => block.component === "ProjectCaseHeader")?.data as
      ProjectCaseHeaderData | undefined,
);

const title = () => header.value?.name;
const description = () => header.value?.headline;

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });
</script>
