<template>
  <component
    :is="tag"
    class="blog-post-list"
    :class="listClass"
  >
    <li
      v-for="(item, index) in data.items"
      :key="index"
      class="blog-post-list-item"
    >
      {{ item }}
    </li>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BlogPostListData } from "~/assets/api/types/blog";

const props = defineProps<{
  data: BlogPostListData;
}>();

const tag = computed(() => (props.data.ordered ? "ol" : "ul"));
const listClass = computed(() =>
  props.data.ordered ? "blog-post-list-ordered" : "blog-post-list-bulleted",
);
</script>

<style src="./BlogPostList.css" />
