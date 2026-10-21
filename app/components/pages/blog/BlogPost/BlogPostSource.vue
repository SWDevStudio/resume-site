<template>
  <div class="blog-post-source">
    <div class="blog-post-source-box">
      <span class="blog-post-source-text">{{ text }}</span>
      <BlogSourceLink
        :source="data.source"
        :kind="data.kind"
        :phrase="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BlogSourceLink from "~/components/pages/blog/shared/BlogSourceLink/BlogSourceLink.vue";
import type { BlogPostSourceData } from "~/types/blog";

const props = defineProps<{
  data: BlogPostSourceData;
}>();

const { t } = useI18n();

const text = computed(() => t(`blog.post.source.${props.data.kind}`));
</script>

<style src="./BlogPostSource.css" />
