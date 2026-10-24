<template>
  <Blog
    :posts="items"
    data-atom-async="blog"
  />
</template>

<script setup lang="ts">
import { useAsyncData, useSeoMeta } from "#imports";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { $api } from "~/assets/api";
import Blog from "~/components/pages/blog/Blog/Blog.vue";

const { t } = useI18n();

const title = () => t("nav.blog");
const description = () => t("seo.blog.description");

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

const { data: posts } = await useAsyncData("blog", () => $api.blog.fetchPosts());
const items = computed(() => posts.value ?? []);
</script>
