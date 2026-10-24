<template>
  <Projects
    :projects="items"
    data-atom-async="projects"
  />
</template>

<script setup lang="ts">
import { useAsyncData } from "#imports";
import { computed } from "vue";
import { $api } from "~/assets/api";
import Projects from "~/components/pages/projects/Projects/Projects.vue";

const { data: projects } = await useAsyncData("projects", () => $api.projects.fetchList());
const items = computed(() => projects.value ?? []);
</script>
