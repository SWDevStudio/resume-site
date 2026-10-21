<template>
  <div class="resume-projects">
    <article
      v-for="project in personal.items"
      :key="project.id"
      class="resume-project"
    >
      <h3 class="resume-project-title">{{ project.name }}</h3>
      <span
        class="resume-project-subtitle"
        lang="en"
        data-atom-skip
      >
        {{ project.stack.join(", ") }}
      </span>
      <p class="resume-text">{{ project.description }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { ResumeData } from "#shared/types/resume";

defineProps<{
  personal: ResumeData["personal"];
}>();
</script>
