<template>
  <ProjectCase
    v-if="blocks"
    :blocks="blocks"
    :data-atom-async="asyncKey"
  />
</template>

<script setup lang="ts">
import { createError, useAsyncData, useRoute } from "#imports";
import { $api } from "~/assets/api";
import ProjectCase from "~/components/pages/projects/ProjectCase/ProjectCase.vue";

const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `project-case-${slug}`;
const { data: blocks } = await useAsyncData(asyncKey, () => $api.projects.fetchCase(slug));

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
</script>
