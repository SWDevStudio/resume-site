<template>
  <ul class="page-sections-nav-list">
    <li
      v-for="item in items"
      :key="item.id"
      class="page-sections-nav-item"
    >
      <a
        class="page-sections-nav-link"
        :class="item.classes"
        :href="item.href"
        :aria-current="item.current"
        :style="item.style"
        @click="emit('select')"
      >
        <span class="page-sections-nav-label">{{ item.name }}</span>
      </a>
      <PageSectionsNavList
        v-if="item.nested"
        :nodes="item.children"
        :active="active"
        :depth="item.depth"
        @select="emit('select')"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Route } from "~/assets/const";
import type { SectionNode } from "./usePageSections";

const props = defineProps<{
  nodes: SectionNode[];
  active: string;
  depth: number;
}>();

const emit = defineEmits<{
  select: [];
}>();

const items = computed(() =>
  props.nodes.map((node) => {
    const current = node.id === props.active;
    return {
      id: node.id,
      name: node.name,
      href: Route.anchor(node.id),
      current: current ? "location" : undefined,
      classes: { "page-sections-nav-link-active": current },
      style: { "--page-sections-depth": props.depth },
      children: node.children,
      nested: node.children.length > 0,
      depth: props.depth + 1,
    };
  }),
);
</script>
