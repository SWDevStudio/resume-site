<template>
  <PageSections
    class="projects"
    :nav-title="t('projects.page.nav.title')"
    :count="count"
    count-key="projects.page.nav.count"
  >
    <ProjectsHeader />
    <ProjectsIntro />
    <template
      v-for="project in projects"
      :key="project.id"
    >
      <span
        class="projects-rule"
        aria-hidden="true"
      />
      <ProjectsCard :project="project" />
    </template>
    <ProjectsMore />
  </PageSections>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProjectView } from "#shared/types/catalog";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import ProjectsCard from "./ProjectsCard.vue";
import ProjectsHeader from "./ProjectsHeader.vue";
import ProjectsIntro from "./ProjectsIntro.vue";
import ProjectsMore from "./ProjectsMore.vue";

const props = defineProps<{
  projects: ProjectView[];
}>();

const { t } = useI18n();

const count = computed(() => props.projects.length);
</script>

<style src="./Projects.css" />
