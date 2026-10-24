<template>
  <PageSections
    class="blog-post"
    :class="toneClass"
    :nav-title="t('blog.post.nav')"
  >
    <BlogPostBlocks
      :blocks="blocks"
      chapters
    />
  </PageSections>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import { useI18n } from "vue-i18n";
import { blogToneClass } from "~/components/pages/blog/shared/blogTone";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import type { BlogBlock, BlogKind, BlogPostSourceData } from "~/assets/api/types/blog";
import BlogPostBlocks from "./BlogPostBlocks.vue";
import { BLOG_POST_SOURCE } from "./blogPostContext";

const props = defineProps<{
  blocks: BlogBlock[];
}>();

const { t } = useI18n();

const kind = computed(
  () =>
    (props.blocks.find((block) => block.component === "BlogPostHeader")?.data.kind as
      BlogKind | undefined) ?? "article",
);
const source = computed(
  () =>
    (props.blocks.find((block) => block.component === "BlogPostSource")?.data as
      BlogPostSourceData | undefined) ?? null,
);
const toneClass = computed(() => blogToneClass(kind.value));

provide(BLOG_POST_SOURCE, source);
</script>

<style src="./BlogPost.css" />
