<template>
  <template
    v-for="group in groups"
    :key="group.key"
  >
    <div
      v-if="group.chapters"
      class="project-case-chapters"
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
import type { ProjectBlock } from "~/types/projectCase";
import ProjectCaseChapter from "./ProjectCaseChapter.vue";
import ProjectCaseCover from "./ProjectCaseCover.vue";
import ProjectCaseHeader from "./ProjectCaseHeader.vue";
import ProjectCaseMeta from "./ProjectCaseMeta.vue";
import ProjectCaseNext from "./ProjectCaseNext.vue";
import ProjectCaseResults from "./ProjectCaseResults.vue";
import ProjectCaseText from "./ProjectCaseText.vue";

const props = defineProps<{
  blocks: ProjectBlock[];
  chapters?: boolean;
}>();

function registry(): Record<string, Component> {
  return {
    ProjectCaseHeader,
    ProjectCaseCover,
    ProjectCaseMeta,
    ProjectCaseChapter,
    ProjectCaseText,
    ProjectCaseResults,
    ProjectCaseNext,
  };
}

interface Item {
  key: string;
  component: Component;
  data: ProjectBlock["data"];
  chapter: boolean;
}

interface Group {
  key: string;
  chapters: boolean;
  items: Item[];
  singles: Item[];
}

const items = computed(() => {
  const known = registry();
  return props.blocks.flatMap((block, index): Item[] => {
    const component = known[block.component];
    if (!component) return [];
    return [
      {
        key: `${index}-${block.component}`,
        component,
        data: block.data,
        chapter: block.component === "ProjectCaseChapter",
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
