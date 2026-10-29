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
import { Route } from "~/assets/const";
import type { BlogPostHeaderData } from "~/assets/api/types/blog";
import BlogPost from "~/components/pages/blog/BlogPost/BlogPost.vue";
import {
  blogPostingNode,
  breadcrumbNode,
  personRef,
  useSiteUrls,
  useStructuredData,
} from "~/composables/useStructuredData";

const { t } = useI18n();
const site = useSiteUrls();
const route = useRoute();
const slug = String(route.params.slug);
const asyncKey = `blog-post-${slug}`;
const { data } = await useAsyncData(asyncKey, async () => {
  const [blocks, posts, person] = await Promise.all([
    $api.blog.fetchPost(slug),
    $api.blog.fetchPosts(),
    $api.profile.fetchPerson(),
  ]);
  return { blocks, summary: posts.find((post) => post.slug === slug), person };
});
const blocks = computed(() => data.value?.blocks);

if (!blocks.value) throw createError({ statusCode: 404, statusMessage: "Page Not Found" });

const header = computed(
  () =>
    blocks.value?.find((block) => block.component === "BlogPostHeader")?.data as
      BlogPostHeaderData | undefined,
);

const name = computed(() => data.value?.person.name ?? "");
const title = () => t("seo.post.title", { post: header.value?.title, author: name.value });
const description = () =>
  data.value?.summary?.excerpt ?? t("seo.blog.description", { name: name.value });

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: "article" });

useStructuredData(() => {
  const post = header.value;
  const person = data.value?.person;
  if (!post || !person) return [];
  const url = site.page(Route.post(slug));
  return [
    blogPostingNode(
      {
        title: post.title,
        description: data.value?.summary?.excerpt,
        url,
        publishedAt: post.publishedAt,
      },
      personRef(person, site),
    ),
    breadcrumbNode([
      { name: t("nav.home"), url: site.page(Route.home) },
      { name: t("nav.blog"), url: site.page(Route.blog) },
      { name: post.title, url },
    ]),
  ];
});
</script>
