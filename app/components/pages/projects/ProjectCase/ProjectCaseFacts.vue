<template>
  <div class="project-case-facts">
    <dl
      class="project-case-facts-list"
      :style="gridStyle"
    >
      <div
        v-for="fact in facts"
        :key="fact.key"
        class="project-case-fact"
      >
        <dt class="project-case-fact-label">{{ fact.label }}</dt>
        <dd class="project-case-fact-value">{{ fact.value }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProjectCaseFactsData } from "~/assets/api/types/projectCase";
import { gridColumns } from "./projectCaseGrid";

const props = defineProps<{
  data: ProjectCaseFactsData;
}>();

const { t } = useI18n();

const facts = computed(() =>
  props.data.facts.map((fact) => ({
    key: fact.key,
    label: t(`projects.case.facts.${fact.key}`),
    value: fact.value,
  })),
);

const gridStyle = computed(() => gridColumns(props.data.facts.length, "project-case-facts"));
</script>

<style src="./ProjectCaseFacts.css" />
