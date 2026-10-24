<template>
  <PageCover
    class="projects-card-cover"
    role="img"
    :aria-label="alt"
  >
    <PageDevices
      :image="source"
      :image-mobile="mobileSource"
    />
  </PageCover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PageCover from "~/components/pages/shared/PageCover/PageCover.vue";
import PageDevices from "~/components/pages/shared/PageDevices/PageDevices.vue";
import { resolveProjectImage } from "~/components/pages/shared/projectImage";

const props = defineProps<{
  image: string;
  imageMobile?: string | null;
  alt: string;
}>();

const source = computed(() => resolveProjectImage(props.image));
const mobileSource = computed(() =>
  props.imageMobile ? resolveProjectImage(props.imageMobile) : null,
);
</script>

<style src="./ProjectsCardCover.css" />
