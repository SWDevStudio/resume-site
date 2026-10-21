<template>
  <Blog
    :posts="items"
    data-atom-async="blog"
  />
</template>

<script setup lang="ts">
import { useAsyncData } from "#imports";
import { computed } from "vue";
import { $api } from "~/assets/api";
import Blog from "~/components/pages/blog/Blog/Blog.vue";

const { data: posts } = await useAsyncData("blog", () => $api.blog.fetchPosts());
const items = computed(() => posts.value ?? []);
</script>
