<template>
  <article
    ref="root"
    class="blog-card"
    :class="toneClass"
  >
    <NuxtLinkLocale
      class="blog-card-cover"
      :to="href"
      aria-hidden="true"
      tabindex="-1"
    >
      <BlogCover
        :cover="post.cover"
        size="card"
      />
    </NuxtLinkLocale>
    <div class="blog-card-meta">
      <BlogKindLabel
        :post="post"
        :platform="post.source.name"
      />
      <span class="blog-card-date">{{ dateText }}</span>
    </div>
    <component
      :is="tag"
      :id="headingId"
      class="blog-card-title"
    >
      <NuxtLinkLocale
        class="blog-card-link"
        :to="href"
      >
        <span
          :class="titleClass"
          :lang="titleLang"
          :data-atom-skip="titleSkip"
        >
          {{ post.title }}
        </span>
      </NuxtLinkLocale>
    </component>
    <p class="blog-card-excerpt">{{ post.excerpt }}</p>
    <div class="blog-card-actions">
      <BlogSourceLink
        :source="post.source"
        :kind="post.kind"
      />
      <UiButton
        class="blog-card-cta btn-block btn-md"
        :class="buttonClass"
        :to="href"
      >
        {{ t(`blog.card.cta.${post.kind}`) }}
      </UiButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import BlogCover from "~/components/pages/blog/shared/BlogCover/BlogCover.vue";
import BlogKindLabel from "~/components/pages/blog/shared/BlogKindLabel/BlogKindLabel.vue";
import BlogSourceLink from "~/components/pages/blog/shared/BlogSourceLink/BlogSourceLink.vue";
import { blogTone, blogToneClass } from "~/components/pages/blog/shared/blogTone";
import { useSectionEntry } from "~/components/pages/shared/PageSections/usePageSections";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import type { BlogPostSummary } from "~/assets/api/types/blog";

const props = defineProps<{
  post: BlogPostSummary;
}>();

const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const entry = reactive({
  name: computed(() => props.post.title),
  id: computed(() => `post-${props.post.slug}`),
});
const { node, attach, detach } = useSectionEntry(entry);

const tag = computed(() => `h${node.value?.level ?? 2}`);
const headingId = computed(() => node.value?.id);
const href = computed(() => Route.post(props.post.slug));
const toneClass = computed(() => blogToneClass(props.post.kind));
const buttonClass = computed(() => `btn-${blogTone(props.post.kind)}`);
const dateText = computed(() =>
  props.post.kind === "tool" ? props.post.version : props.post.publishedAt,
);
const isTool = computed(() => props.post.kind === "tool");
const titleClass = computed(() => ({ "blog-card-name": isTool.value }));
const titleLang = computed(() => (isTool.value ? "en" : undefined));
const titleSkip = computed(() => (isTool.value ? "" : undefined));

onMounted(() => attach(root.value));
onBeforeUnmount(detach);
</script>

<style src="./BlogCard.css" />
