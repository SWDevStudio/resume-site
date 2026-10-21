<template>
  <div class="resume-projects">
    <ResumeProject
      v-for="project in projects.items"
      :key="project.id"
      :project="project"
    />
  </div>
</template>

<script setup lang="ts">
import ResumeProject from "./ResumeProject.vue";
import type { ResumeData } from "#shared/types/resume";

defineProps<{
  projects: ResumeData["projects"];
}>();
</script>

<style src="./ResumeProjects.css" />
