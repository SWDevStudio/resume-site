<template>
  <ul class="blog-post-facts">
    <li
      v-for="fact in facts"
      :key="fact.key"
      class="blog-post-facts-item"
    >
      <BlogTag small>
        <span
          :lang="fact.lang"
          :data-atom-skip="fact.skip"
        >
          {{ fact.text }}
        </span>
      </BlogTag>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BlogTag from "~/components/pages/blog/shared/BlogTag/BlogTag.vue";
import type { BlogPostFactsData } from "~/types/blog";

interface Fact {
  key: string;
  text: string;
  technical?: boolean;
}

const props = defineProps<{
  data: BlogPostFactsData;
}>();

const { t } = useI18n();

const rawFacts = computed<Fact[]>(() => [
  { key: "stars", text: t("blog.post.stars", { value: props.data.stars }) },
  { key: "forks", text: t("blog.post.forks", { value: props.data.forks }) },
  { key: "language", text: props.data.language, technical: true },
  { key: "license", text: props.data.license, technical: true },
  { key: "version", text: props.data.version },
]);

const facts = computed(() =>
  rawFacts.value.map((fact) => ({
    key: fact.key,
    text: fact.text,
    lang: fact.technical ? "en" : undefined,
    skip: fact.technical ? "" : undefined,
  })),
);
</script>

<style src="./BlogPostFacts.css" />
