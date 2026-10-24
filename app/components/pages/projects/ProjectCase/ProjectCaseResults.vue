<template>
  <div class="project-case-results">
    <ul
      class="project-case-stats"
      :style="gridStyle"
    >
      <li
        v-for="stat in data.stats"
        :key="stat.label"
        class="project-case-stat"
      >
        <span class="project-case-stat-value">{{ stat.value }}</span>
        <span class="project-case-stat-label">{{ stat.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProjectCaseResultsData } from "~/assets/api/types/projectCase";
import { gridColumns } from "./projectCaseGrid";

const props = defineProps<{
  data: ProjectCaseResultsData;
}>();

const gridStyle = computed(() => gridColumns(props.data.stats.length, "project-case-stats"));
</script>

<style src="./ProjectCaseResults.css" />
