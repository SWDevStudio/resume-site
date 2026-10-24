<template>
  <div class="project-case-steps project-case-frame">
    <ol
      class="project-case-steps-list project-case-frame-clip"
      :style="gridStyle"
    >
      <li
        v-for="step in steps"
        :key="step.index"
        class="project-case-step"
      >
        <span class="project-case-step-index">{{ step.index }}</span>
        <span class="project-case-step-title">{{ step.title }}</span>
        <span class="project-case-step-text">{{ step.text }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProjectCaseStepsData } from "~/assets/api/types/projectCase";
import { gridColumns } from "./projectCaseGrid";

const props = defineProps<{
  data: ProjectCaseStepsData;
}>();

const steps = computed(() =>
  props.data.steps.map((step, position) => ({
    index: String(position + 1).padStart(2, "0"),
    title: step.title,
    text: step.text,
  })),
);
const gridStyle = computed(() => gridColumns(props.data.steps.length, "project-case-steps"));
</script>

<style src="./ProjectCaseSteps.css" />
