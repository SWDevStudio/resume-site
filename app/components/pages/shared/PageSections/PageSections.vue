<template>
  <div class="page-sections container">
    <div class="page-sections-content">
      <slot />
    </div>
    <div class="page-sections-aside">
      <PageSectionsNav
        :title="navTitle"
        :count-roots="countRoots"
        :count="count"
        :count-key="countKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PageSectionsNav from "./PageSectionsNav.vue";
import { provideSectionsRegistry } from "./usePageSections";
import { usePageSectionsSpy } from "./usePageSectionsSpy";

withDefaults(
  defineProps<{
    navTitle: string;
    countRoots?: boolean;
    count?: number;
    countKey?: string;
  }>(),
  { countKey: "pageSections.count" },
);

const registry = provideSectionsRegistry();
usePageSectionsSpy(registry);
</script>

<style src="./PageSections.css" />
