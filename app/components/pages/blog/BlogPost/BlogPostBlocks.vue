<template>
  <template
    v-for="group in groups"
    :key="group.key"
  >
    <div
      v-if="group.chapters"
      class="blog-post-chapters"
    >
      <component
        :is="item.component"
        v-for="item in group.items"
        :key="item.key"
        :data="item.data"
      />
    </div>
    <component
      :is="item.component"
      v-for="item in group.singles"
      v-else
      :key="item.key"
      :data="item.data"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import type { BlogBlock } from "~/types/blog";
import { blogPostBlocks } from "./blogPostBlocks";

const props = defineProps<{
  blocks: BlogBlock[];
  chapters?: boolean;
}>();

interface Item {
  key: string;
  component: Component;
  data: BlogBlock["data"];
  chapter: boolean;
}

interface Group {
  key: string;
  chapters: boolean;
  items: Item[];
  singles: Item[];
}

const items = computed(() => {
  return props.blocks.flatMap((block, index): Item[] => {
    const component = blogPostBlocks[block.component];
    if (!component) return [];
    return [
      {
        key: `${index}-${block.component}`,
        component,
        data: block.data,
        chapter: block.component === "BlogPostChapter",
      },
    ];
  });
});

const groups = computed(() =>
  items.value.reduce<Group[]>((result, item) => {
    const last = result.at(-1);
    if (props.chapters && item.chapter && last?.chapters) {
      last.items.push(item);
      return result;
    }
    const chapters = Boolean(props.chapters && item.chapter);
    result.push({
      key: item.key,
      chapters,
      items: chapters ? [item] : [],
      singles: chapters ? [] : [item],
    });
    return result;
  }, []),
);
</script>
