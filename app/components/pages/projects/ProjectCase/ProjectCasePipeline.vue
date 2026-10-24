<template>
  <ol class="project-case-pipeline">
    <li
      v-for="stage in data.stages"
      :key="stage.name"
      class="project-case-pipeline-step"
    >
      <UiBadge
        class="project-case-pipeline-stage badge-accent"
        lang="en"
        data-atom-skip
      >
        {{ stage.name }}
      </UiBadge>
      <span
        v-if="stage.next"
        class="project-case-pipeline-link"
      >
        <UiIcon
          name="arrow-right"
          class="project-case-pipeline-arrow"
        />
        {{ stage.next }}
      </span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { ProjectCasePipelineData } from "~/assets/api/types/projectCase";

defineProps<{
  data: ProjectCasePipelineData;
}>();
</script>

<style src="./ProjectCasePipeline.css" />
