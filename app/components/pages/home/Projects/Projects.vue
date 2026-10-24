<template>
  <HomeSlide
    id="projects"
    class="home-projects"
  >
    <template #backdrop>
      <ProjectsDecor />
    </template>

    <div class="home-projects-main">
      <div class="home-projects-head">
        <span class="home-projects-label">{{ t("home.projects.label") }}</span>
        <h2 class="home-projects-title">
          {{ t("home.projects.titleTop") }}
          <span class="home-projects-accent">{{ t("home.projects.titleAccent") }}</span>
        </h2>
        <p class="home-projects-description">{{ t("home.projects.description") }}</p>
      </div>

      <ProjectsList :projects="projects" />
      <ProjectsAll />
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import type { ProjectView } from "~/assets/api/types/catalog";
import ProjectsDecor from "./ProjectsDecor.vue";
import ProjectsAll from "./ProjectsAll.vue";
import ProjectsList from "./ProjectsList.vue";

defineProps<{
  projects: ProjectView[];
}>();

const { t } = useI18n();
</script>

<style src="./Projects.css" />
