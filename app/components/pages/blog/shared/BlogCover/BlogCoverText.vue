<template>
  <div class="blog-cover-text">
    <span
      v-for="line in lines"
      :key="line.key"
      class="blog-cover-line"
      :class="line.classes"
      :style="line.style"
    >
      {{ line.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BlogCoverText } from "~/types/blog";

const props = defineProps<{
  cover: BlogCoverText;
}>();

const lines = computed(() =>
  props.cover.lines.map((line, index) => ({
    key: `${index}-${line.text}`,
    text: line.text,
    classes: {
      "blog-cover-line-muted": line.muted,
      "blog-cover-line-strike": line.strike,
    },
    style: {
      "--blog-cover-line-scale": line.scale ?? 1,
      "--blog-cover-line-indent": `${line.indent ?? 0}em`,
    },
  })),
);
</script>

<style src="./BlogCoverText.css" />
