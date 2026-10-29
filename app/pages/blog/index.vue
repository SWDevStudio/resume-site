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
import { Route } from "~/assets/const";
import Blog from "~/components/pages/blog/Blog/Blog.vue";
import { breadcrumbNode, useSiteUrls, useStructuredData } from "~/composables/useStructuredData";

const { t } = useI18n();
const site = useSiteUrls();

const { data } = await useAsyncData("blog", async () => {
  const [posts, person] = await Promise.all([$api.blog.fetchPosts(), $api.profile.fetchPerson()]);
  return { posts, person };
});
const items = computed(() => data.value?.posts ?? []);
const name = computed(() => data.value?.person.name ?? "");

const title = () => t("seo.blog.title", { name: name.value });
const description = () => t("seo.blog.description", { name: name.value });

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

useStructuredData(() => [
  breadcrumbNode([
    { name: t("nav.home"), url: site.page(Route.home) },
    { name: t("nav.blog"), url: site.page(Route.blog) },
  ]),
]);
</script>
