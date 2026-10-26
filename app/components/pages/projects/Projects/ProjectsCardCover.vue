<template>
  <PageCover
    class="projects-card-cover"
    role="img"
    :aria-label="alt"
  >
    <PageTerminal
      v-if="terminal"
      :image="source"
    />
    <PageDevices
      v-else
      :image="source"
      :image-mobile="mobileSource"
    />
  </PageCover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PageCover from "~/components/pages/shared/PageCover/PageCover.vue";
import PageDevices from "~/components/pages/shared/PageDevices/PageDevices.vue";
import PageTerminal from "~/components/pages/shared/PageTerminal/PageTerminal.vue";
import { resolveProjectImage } from "~/components/pages/shared/projectImage";
import type { PreviewFrame } from "~/assets/api/types/catalog";

const props = defineProps<{
  image: string;
  imageMobile?: string | null;
  frame: PreviewFrame;
  alt: string;
}>();

const terminal = computed(() => props.frame === "terminal");
const source = computed(() => resolveProjectImage(props.image));
const mobileSource = computed(() =>
  props.imageMobile ? resolveProjectImage(props.imageMobile) : null,
);
</script>

<style src="./ProjectsCardCover.css" />
