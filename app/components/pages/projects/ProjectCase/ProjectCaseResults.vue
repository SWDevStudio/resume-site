<template>
  <div class="project-case-results">
    <ul class="project-case-stats">
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
import type { ProjectCaseResultsData } from "~/types/projectCase";

defineProps<{
  data: ProjectCaseResultsData;
}>();
</script>

<style src="./ProjectCaseResults.css" />
