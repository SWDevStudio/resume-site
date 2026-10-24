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
import Projects from "~/components/pages/projects/Projects/Projects.vue";

const { t } = useI18n();

const title = () => t("nav.projects");
const description = () => t("seo.projects.description");

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

const { data: projects } = await useAsyncData("projects", () => $api.projects.fetchList());
const items = computed(() => projects.value ?? []);
</script>
