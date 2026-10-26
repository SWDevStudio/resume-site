<template>
  <PageSections
    class="projects"
    :nav-title="t('projects.page.nav.title')"
    :count="count"
    count-key="projects.page.nav.count"
  >
    <ProjectsHeader />
    <template
      v-for="card in cards"
      :key="card.project.id"
    >
      <span
        class="projects-rule"
        aria-hidden="true"
      />
      <ProjectsCard
        :project="card.project"
        :loading="card.loading"
      />
    </template>
    <ProjectsMore />
  </PageSections>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProjectView } from "~/assets/api/types/catalog";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import ProjectsCard from "./ProjectsCard.vue";
import ProjectsHeader from "./ProjectsHeader.vue";
import ProjectsMore from "./ProjectsMore.vue";

const EAGER_CARDS = 1;

interface ProjectsCardItem {
  project: ProjectView;
  loading: "eager" | "lazy";
}

const props = defineProps<{
  projects: ProjectView[];
}>();

const { t } = useI18n();

const count = computed(() => props.projects.length);
const cards = computed<ProjectsCardItem[]>(() =>
  props.projects.map((project, index) => ({
    project,
    loading: index < EAGER_CARDS ? "eager" : "lazy",
  })),
);
</script>

<style src="./Projects.css" />
