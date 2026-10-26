<template>
  <PageCover
    class="projects-card-cover"
    role="img"
    :aria-label="alt"
  >
    <PageTerminal
      v-if="terminal"
      :image="image"
      :loading="loading"
    />
    <PageDevices
      v-else
      :image="image"
      :image-mobile="imageMobile"
      :loading="loading"
    />
  </PageCover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PreviewFrame } from "~/assets/api/types/catalog";
import type { ImageAsset } from "~/assets/api/types/media";
import PageCover from "~/components/pages/shared/PageCover/PageCover.vue";
import PageDevices from "~/components/pages/shared/PageDevices/PageDevices.vue";
import PageTerminal from "~/components/pages/shared/PageTerminal/PageTerminal.vue";

const props = withDefaults(
  defineProps<{
    image: ImageAsset | null;
    imageMobile?: ImageAsset | null;
    frame: PreviewFrame;
    alt: string;
    loading?: "lazy" | "eager";
  }>(),
  { imageMobile: null, loading: "lazy" },
);

const terminal = computed(() => props.frame === "terminal");
</script>

<style src="./ProjectsCardCover.css" />
