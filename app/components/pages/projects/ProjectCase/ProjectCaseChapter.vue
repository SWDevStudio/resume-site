<template>
  <PageSection
    :id="data.id"
    :name="data.name"
  >
    <ProjectCaseBlocks :blocks="data.blocks" />
  </PageSection>
</template>

<script setup lang="ts">
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import type { ProjectCaseChapterData } from "~/assets/api/types/projectCase";
import ProjectCaseBlocks from "./ProjectCaseBlocks.vue";

defineProps<{
  data: ProjectCaseChapterData;
}>();
</script>
