<template>
  <div
    class="blog-post-callout"
    :class="variantClass"
    role="note"
  >
    <div class="blog-post-callout-box">
      <span class="blog-post-callout-label">{{ label }}</span>
      <span class="blog-post-callout-text">{{ data.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { BlogPostCalloutData } from "~/types/blog";

const props = defineProps<{
  data: BlogPostCalloutData;
}>();

const { t } = useI18n();

const label = computed(() => t(`blog.post.callout.${props.data.variant}`));
const variantClass = computed(() => `blog-post-callout-${props.data.variant}`);
</script>

<style src="./BlogPostCallout.css" />
