<template>
  <div class="home-projects-list">
    <div
      ref="viewport"
      class="home-projects-viewport"
    >
      <div class="home-projects-track">
        <div
          v-for="project in items"
          :key="project.id"
          class="home-projects-slide"
        >
          <ProjectsCard :project="project" />
        </div>
      </div>
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
import { computed, ref, watch } from "vue";
import { usePreferredReducedMotion } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import emblaCarouselVue from "embla-carousel-vue";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import type { ProjectView } from "~/assets/api/types/catalog";
import ProjectsCard from "./ProjectsCard.vue";
import { cycleTones, projectTones } from "./projects";

const props = defineProps<{
  projects: ProjectView[];
}>();

const CAROUSEL: EmblaOptionsType = {
  loop: true,
  align: "start",
  breakpoints: { "(max-width: 47.99rem)": { active: false } },
};

const { t } = useI18n();

const [viewport, carousel] = emblaCarouselVue(CAROUSEL, [WheelGesturesPlugin()]);
const motion = usePreferredReducedMotion();
const current = ref(0);

const items = computed(() => {
  const tones = cycleTones(props.projects.length);
  return props.projects.map((project, index) => ({ ...project, tone: tones[index]! }));
});

const dots = computed(() =>
  items.value.map((project, index) => {
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

function sync(api: EmblaCarouselType) {
  current.value = api.selectedScrollSnap();
}

watch(carousel, (api) => {
  if (!api) return;
  api.on("select", sync).on("reInit", sync);
  sync(api);
});

function show(index: number) {
  const api = carousel.value;
  if (!api) return;
  current.value = index;
  api.scrollTo(index, motion.value === "reduce");
}
</script>

<style src="./ProjectsList.css" />
