<template>
  <p class="project-case-text">{{ data.text }}</p>
</template>

<script setup lang="ts">
import type { ProjectCaseTextData } from "~/assets/api/types/projectCase";

defineProps<{
  data: ProjectCaseTextData;
}>();
</script>
