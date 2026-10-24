<template>
  <PageCover
    class="blog-cover"
    :class="rootClass"
    aria-hidden="true"
    lang="en"
    data-atom-skip
  >
    <component
      :is="part"
      :cover="cover"
    />
  </PageCover>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import PageCover from "~/components/pages/shared/PageCover/PageCover.vue";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { BlogCover, BlogCoverSize, BlogTone } from "~/assets/api/types/blog";
import BlogCoverTerminal from "./BlogCoverTerminal.vue";
import BlogCoverText from "./BlogCoverText.vue";
import BlogCoverVideo from "./BlogCoverVideo.vue";

const props = withDefaults(
  defineProps<{
    cover: BlogCover;
    size?: BlogCoverSize;
    tone?: BlogTone;
  }>(),
  { size: "card", tone: undefined },
);

function registry(): Record<BlogCover["type"], Component> {
  return {
    text: BlogCoverText,
    terminal: BlogCoverTerminal,
    video: BlogCoverVideo,
  };
}

const part = computed(() => registry()[props.cover.type]);
const rootClass = computed(() => [
  `blog-cover-${props.size}`,
  `blog-cover-type-${props.cover.type}`,
  ...(props.tone ? pageToneClass(props.tone) : []),
]);
</script>

<style src="./BlogCover.css" />
