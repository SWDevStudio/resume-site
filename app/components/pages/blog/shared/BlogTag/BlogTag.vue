<template>
  <span
    class="blog-tag"
    :class="rootClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { BlogTone } from "~/types/blog";

const props = withDefaults(
  defineProps<{
    tone?: BlogTone;
    small?: boolean;
  }>(),
  { tone: undefined },
);

const rootClass = computed(() => [
  ...(props.tone ? pageToneClass(props.tone) : []),
  { "blog-tag-small": props.small },
]);
</script>

<style src="./BlogTag.css" />
