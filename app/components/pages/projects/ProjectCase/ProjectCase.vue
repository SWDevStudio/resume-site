<template>
  <PageSections
    class="project-case project-case-tone"
    :class="toneClass"
    :nav-title="t('projects.case.nav')"
  >
    <ProjectCaseBlocks
      :blocks="blocks"
      chapters
    />
  </PageSections>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import PageSections from "~/components/pages/shared/PageSections/PageSections.vue";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { ProjectBlock, ProjectCaseTone } from "~/assets/api/types/projectCase";
import ProjectCaseBlocks from "./ProjectCaseBlocks.vue";

const props = defineProps<{
  blocks: ProjectBlock[];
}>();

const { t } = useI18n();

const tone = computed(
  () =>
    props.blocks.find((block) => block.component === "ProjectCaseHeader")?.data
      .tone as ProjectCaseTone,
);
const toneClass = computed(() => [`project-case-tone-${tone.value}`, ...pageToneClass(tone.value)]);
</script>

<style src="./ProjectCase.css" />
