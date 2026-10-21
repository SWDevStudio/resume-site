<template>
  <PageSections
    class="blog"
    :class="rootClass"
    :nav-title="t('blog.nav.title')"
    count-roots
    count-key="blog.nav.count"
  >
    <BlogHeader />
    <BlogFilters
      v-if="hasPosts"
      :options="options"
      :active="active"
      @select="select"
    />
    <TransitionGroup
      v-if="hasVisible"
      tag="div"
      name="blog-list"
      class="blog-cards"
    >
      <BlogCard
        v-for="post in visible"
        :key="post.slug"
        :post="post"
      />
    </TransitionGroup>
    <p
      v-else
      class="blog-empty"
    >
      {{ t("blog.empty") }}
    </p>
  </PageSections>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { countBlogKinds } from "~/components/pages/blog/shared/blogCatalog";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import type { BlogPostSummary } from "~/types/blog";
import BlogCard from "./BlogCard.vue";
import type { BlogFilter, BlogFilterOption } from "./blogFilter";
import BlogFilters from "./BlogFilters.vue";
import BlogHeader from "./BlogHeader.vue";

const props = defineProps<{
  posts: BlogPostSummary[];
}>();

const { t } = useI18n();

const filter = ref<BlogFilter>("all");

const options = computed<BlogFilterOption[]>(() => [
  { key: "all", count: props.posts.length },
  ...countBlogKinds(props.posts).map(({ kind, count }) => ({ key: kind, count })),
]);
const active = computed(() =>
  options.value.some((option) => option.key === filter.value) ? filter.value : "all",
);
const visible = computed(() =>
  active.value === "all" ? props.posts : props.posts.filter((post) => post.kind === active.value),
);
const hasPosts = computed(() => props.posts.length > 0);
const hasVisible = computed(() => visible.value.length > 0);
const rootClass = computed(() => ({ "blog-bare": !hasPosts.value }));

function select(key: BlogFilter) {
  filter.value = key;
}
</script>

<style src="./Blog.css" />
