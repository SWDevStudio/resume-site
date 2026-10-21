<template>
  <section
    class="blog-post-related"
    aria-labelledby="blog-post-related-title"
  >
    <h2
      id="blog-post-related-title"
      class="blog-post-related-title"
    >
      {{ t("blog.post.related") }}
    </h2>
    <ul class="blog-post-related-list">
      <li
        v-for="item in items"
        :key="item.slug"
        class="blog-post-related-item"
      >
        <NuxtLinkLocale
          class="blog-post-related-link"
          :class="item.toneClass"
          :to="item.href"
        >
          <BlogCover
            :cover="item.cover"
            size="compact"
          />
          <I18nT
            v-if="item.tool"
            keypath="blog.kind.tool"
            tag="span"
            class="blog-post-related-kind"
          >
            <template #name>
              <span
                lang="en"
                data-atom-skip
              >
                GitHub
              </span>
            </template>
          </I18nT>
          <span
            v-else
            class="blog-post-related-kind"
          >
            {{ item.kindText }}
          </span>
          <span class="blog-post-related-name">{{ item.title }}</span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { Route } from "~/assets/const";
import { computed } from "vue";
import { I18nT, useI18n } from "vue-i18n";
import BlogCover from "~/components/pages/blog/shared/BlogCover/BlogCover.vue";
import { blogToneClass } from "~/components/pages/blog/shared/blogTone";
import type { BlogPostRelatedData } from "~/types/blog";

const props = defineProps<{
  data: BlogPostRelatedData;
}>();

const { t } = useI18n();

const items = computed(() =>
  props.data.items.map((item) => ({
    slug: item.slug,
    title: item.title,
    cover: item.cover,
    href: Route.post(item.slug),
    tool: item.kind === "tool",
    kindText: t(`blog.kind.${item.kind}`),
    toneClass: blogToneClass(item.kind),
  })),
);
</script>

<style src="./BlogPostRelated.css" />
