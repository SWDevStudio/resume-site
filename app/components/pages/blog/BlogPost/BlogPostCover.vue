<template>
  <a
    v-if="link"
    class="blog-post-cover blog-post-cover-link"
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <BlogCover
      :cover="data.cover"
      size="hero"
    />
    <span class="sr-only">
      <I18nT
        :keypath="keypath"
        tag="span"
      >
        <template #name>
          <span
            lang="en"
            data-atom-skip
          >
            {{ link.name }}
          </span>
        </template>
      </I18nT>
    </span>
  </a>
  <BlogCover
    v-else
    class="blog-post-cover"
    :cover="data.cover"
    size="hero"
  />
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { I18nT } from "vue-i18n";
import BlogCover from "~/components/pages/blog/shared/BlogCover/BlogCover.vue";
import type { BlogPostCoverData } from "~/assets/api/types/blog";
import { BLOG_POST_SOURCE } from "./blogPostContext";

const props = defineProps<{
  data: BlogPostCoverData;
}>();

const context = inject(BLOG_POST_SOURCE, null);

const link = computed(() => (props.data.cover.type === "video" ? context?.value?.source : null));
const keypath = computed(() => `blog.card.source.${context?.value?.kind ?? "video"}`);
</script>

<style src="./BlogPostCover.css" />
