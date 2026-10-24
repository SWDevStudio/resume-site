<template>
  <div class="project-case-meta">
    <ul class="project-case-tags">
      <li
        v-for="tag in data.tags"
        :key="tag"
        class="project-case-tag"
      >
        {{ tag }}
      </li>
    </ul>
    <p class="project-case-stack">
      <span class="project-case-stack-label">{{ t("projects.case.stack") }}:</span>
      <span
        lang="en"
        data-atom-skip
      >
        {{ stack }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProjectCaseMetaData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseMetaData;
}>();

const { t } = useI18n();

const stack = computed(() => ` ${props.data.stack.join(" · ")}`);
</script>

<style src="./ProjectCaseMeta.css" />
