<template>
  <HomeSlide
    id="projects"
    ref="root"
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
import { useIntersectionObserver } from "@vueuse/core";
import { useTemplateRef, type ComponentPublicInstance } from "vue";
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import type { ProjectView } from "~/assets/api/types/catalog";
import { $metrika } from "~/assets/metrika";
import ProjectsDecor from "./ProjectsDecor.vue";
import ProjectsAll from "./ProjectsAll.vue";
import ProjectsList from "./ProjectsList.vue";

defineProps<{
  projects: ProjectView[];
}>();

const { t } = useI18n();

const slide = useTemplateRef<ComponentPublicInstance>("root");

const VIEW_THRESHOLDS = Array.from({ length: 21 }, (_, step) => step / 20);

function isSectionViewed(entry: IntersectionObserverEntry) {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= 1) return true;
  const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRect.height >= viewportHeight / 3;
}

const { stop } = useIntersectionObserver(
  slide,
  ([entry]) => {
    if (!entry || !isSectionViewed(entry)) return;
    stop();
    $metrika.projects.viewSection();
  },
  { threshold: VIEW_THRESHOLDS },
);
</script>

<style src="./Projects.css" />
