<template>
  <PageSection
    :id="data.id"
    :name="data.name"
    :hide-heading="data.hidden"
  >
    <BlogPostBlocks :blocks="data.blocks" />
  </PageSection>
</template>

<script setup lang="ts">
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import type { BlogPostChapterData } from "~/types/blog";
import BlogPostBlocks from "./BlogPostBlocks.vue";

defineProps<{
  data: BlogPostChapterData;
}>();
</script>
