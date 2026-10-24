<template>
  <div class="home-projects-list">
    <div
      ref="track"
      class="home-projects-track"
    >
      <ProjectsCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
    <div
      class="home-projects-dots"
      role="group"
      :aria-label="t('home.projects.navigation')"
    >
      <button
        v-for="dot in dots"
        :key="dot.key"
        class="home-projects-dot"
        :class="dot.classes"
        type="button"
        :aria-label="dot.label"
        :aria-current="dot.active"
        @click="show(dot.index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import type { ProjectView } from "~/assets/api/types/catalog";
import ProjectsCard from "./ProjectsCard.vue";
import { projectTones } from "./projects";

const props = defineProps<{
  projects: ProjectView[];
}>();

const { t } = useI18n();

const track = ref<HTMLElement | null>(null);
const current = ref(0);

const dots = computed(() =>
  props.projects.map((project, index) => {
    const active = index === current.value;
    return {
      key: project.id,
      index,
      active,
      classes: [projectTones[project.tone].dotClass, { "home-projects-dot-active": active }],
      label: t("home.projects.show", { number: index + 1 }),
    };
  }),
);

function cards() {
  return [...(track.value?.children ?? [])] as HTMLElement[];
}

function start() {
  return track.value ? Number.parseFloat(getComputedStyle(track.value).paddingLeft) : 0;
}

let target: number | null = null;

function release() {
  target = null;
}

function sync() {
  const element = track.value;
  if (!element) return;
  if (target !== null) {
    if (Math.abs(element.scrollLeft - target) > 1) return;
    release();
  }
  let nearest = 0;
  let distance = Number.POSITIVE_INFINITY;
  cards().forEach((card, index) => {
    const gap = Math.abs(card.offsetLeft - start() - element.scrollLeft);
    if (gap < distance) {
      distance = gap;
      nearest = index;
    }
  });
  current.value = nearest;
}

function show(index: number) {
  const card = cards()[index];
  if (!card) return;
  current.value = index;
  target = card.offsetLeft - start();
  track.value?.scrollTo({ left: target });
}

useEventListener(track, "scroll", sync, { passive: true });
useEventListener(track, "scrollend", () => {
  release();
  sync();
});
useEventListener(track, "pointerdown", release, { passive: true });
</script>

<style src="./ProjectsList.css" />
