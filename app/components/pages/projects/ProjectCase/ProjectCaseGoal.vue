<template>
  <div
    class="project-case-goal project-case-frame project-case-frame-tone project-case-frame-soft"
    :class="toneClass"
  >
    <span class="project-case-goal-value">{{ data.value }}</span>
    <p class="project-case-goal-text">{{ data.text }}</p>
  </div>
</template>

<script setup lang="ts">
import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { ProjectCaseGoalData } from "~/assets/api/types/projectCase";

defineProps<{
  data: ProjectCaseGoalData;
}>();

const toneClass = pageToneClass("secondary");
</script>

<style src="./ProjectCaseGoal.css" />
