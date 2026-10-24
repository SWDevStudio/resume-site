<template>
  <BlogPost
    v-if="blocks"
    :blocks="blocks"
    :data-atom-async="asyncKey"
  />
</template>

<script setup lang="ts">
import { createError, useAsyncData, useRoute, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import type { BlogPostHeaderData } from "~/assets/api/types/blog";
import BlogPost from "~/components/pages/blog/BlogPost/BlogPost.vue";

const { t } = useI18n();
const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `blog-post-${slug}`;
const { data: blocks } = await useAsyncData(asyncKey, () => $api.blog.fetchPost(slug));

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Page Not Found" });

const header = computed(
  () =>
    blocks.value?.find((block) => block.component === "BlogPostHeader")?.data as
      BlogPostHeaderData | undefined,
);

const title = () => header.value?.title;
const description = () => t("seo.blog.description");

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });
</script>
