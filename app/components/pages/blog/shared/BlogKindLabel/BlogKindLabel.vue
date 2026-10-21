<template>
  <span
    class="blog-kind-label"
    :class="rootClass"
  >
    <I18nT
      v-if="isTool"
      keypath="blog.kind.tool"
      tag="span"
      class="blog-kind-label-kind"
    >
      <template #name>
        <span
          lang="en"
          data-atom-skip
        >
          {{ platform }}
        </span>
      </template>
    </I18nT>
    <span
      v-else
      class="blog-kind-label-kind"
    >
      {{ kindText }}
    </span>
    <span
      v-for="part in parts"
      :key="part.key"
      class="blog-kind-label-part"
      :class="part.classes"
      :lang="part.lang"
      :data-atom-skip="part.skip"
    >
      {{ part.text }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { I18nT, useI18n } from "vue-i18n";
import { blogToneClass } from "~/components/pages/blog/shared/blogTone";
import type { BlogPostHead } from "~/types/blog";

const props = withDefaults(
  defineProps<{
    post: BlogPostHead;
    full?: boolean;
    platform?: string;
  }>(),
  { platform: "GitHub" },
);

const { t } = useI18n();

const isTool = computed(() => props.post.kind === "tool");
const rootClass = computed(() => blogToneClass(props.post.kind));
const kindText = computed(() => t(`blog.kind.${props.post.kind}`));

interface Part {
  key: string;
  text: string;
  keepCase?: boolean;
  technical?: boolean;
}

const rawParts = computed<Part[]>(() => {
  const post = props.post;
  if (post.kind === "article") {
    return [
      { key: "read", text: t("blog.readTime", { count: post.readMinutes }) },
      ...(props.full ? [{ key: "date", text: post.publishedAt, keepCase: true }] : []),
    ];
  }
  if (post.kind === "tool") {
    return [
      { key: "stars", text: `★ ${post.stars}` },
      { key: "language", text: post.language, technical: true },
      ...(props.full ? [{ key: "version", text: post.version, keepCase: true }] : []),
    ];
  }
  return [
    { key: "duration", text: post.duration },
    ...(props.full ? [{ key: "date", text: post.publishedAt, keepCase: true }] : []),
  ];
});

const parts = computed(() =>
  rawParts.value.map((part) => ({
    key: part.key,
    text: part.text,
    classes: { "blog-kind-label-keep": part.keepCase },
    lang: part.technical ? "en" : undefined,
    skip: part.technical ? "" : undefined,
  })),
);
</script>

<style src="./BlogKindLabel.css" />
