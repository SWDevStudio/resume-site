<template>
  <header class="blog-post-header">
    <NuxtLinkLocale
      class="blog-post-back"
      :to="Route.blog"
    >
      <UiIcon
        name="arrow-right"
        class="blog-post-back-icon"
      />
      {{ t("blog.post.back") }}
    </NuxtLinkLocale>
    <BlogKindLabel
      class="blog-post-label"
      :post="data"
      full
    />
    <h1 class="blog-post-title">{{ data.title }}</h1>
    <div class="blog-post-author">
      <span
        class="blog-post-avatar"
        aria-hidden="true"
      >
        {{ data.author.initials }}
      </span>
      <span class="blog-post-author-text">
        <span class="blog-post-author-name">{{ data.author.name }}</span>
        <span
          class="blog-post-author-role"
          lang="en"
          data-atom-skip
        >
          {{ data.author.role }}
        </span>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { Route } from "~/assets/const";
import { useI18n } from "vue-i18n";
import BlogKindLabel from "~/components/pages/blog/shared/BlogKindLabel/BlogKindLabel.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { BlogPostHeaderData } from "~/assets/api/types/blog";

defineProps<{
  data: BlogPostHeaderData;
}>();

const { t } = useI18n();
</script>

<style src="./BlogPostHeader.css" />
