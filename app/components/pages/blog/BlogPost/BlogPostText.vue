<template>
  <p class="blog-post-text">{{ data.text }}</p>
</template>

<script setup lang="ts">
import type { BlogPostTextData } from "~/types/blog";

defineProps<{
  data: BlogPostTextData;
}>();
</script>

<style src="./BlogPostText.css" />
