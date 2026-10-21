<template>
  <BlogPost
    v-if="blocks"
    :blocks="blocks"
    :data-atom-async="asyncKey"
  />
</template>

<script setup lang="ts">
import { createError, useAsyncData, useRoute } from "#imports";
import { $api } from "~/assets/api";
import BlogPost from "~/components/pages/blog/BlogPost/BlogPost.vue";

const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `blog-post-${slug}`;
const { data: blocks } = await useAsyncData(asyncKey, () => $api.blog.fetchPost(slug));

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
</script>
