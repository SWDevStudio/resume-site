<template>
  <ul class="blog-post-tags">
    <li
      v-for="tag in data.tags"
      :key="tag"
      class="blog-post-tags-item"
    >
      <BlogTag>{{ tag }}</BlogTag>
    </li>
  </ul>
</template>

<script setup lang="ts">
import BlogTag from "~/components/pages/blog/shared/BlogTag/BlogTag.vue";
import type { BlogPostTagsData } from "~/types/blog";

defineProps<{
  data: BlogPostTagsData;
}>();
</script>

<style src="./BlogPostTags.css" />
