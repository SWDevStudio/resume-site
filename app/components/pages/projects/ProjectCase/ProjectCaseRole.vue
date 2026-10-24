<template>
  <PageSection
    :id="data.id"
    class="project-case-role project-case-frame"
    :name="data.name"
    :label="t('projects.case.role')"
  >
    <ul class="project-case-role-list">
      <li
        v-for="item in data.items"
        :key="item.title"
        class="project-case-role-item"
      >
        <span class="project-case-role-title">{{ item.title }}</span>
        <span class="project-case-role-text">{{ item.text }}</span>
      </li>
    </ul>
  </PageSection>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import type { ProjectCaseRoleData } from "~/assets/api/types/projectCase";

defineProps<{
  data: ProjectCaseRoleData;
}>();

const { t } = useI18n();
</script>

<style src="./ProjectCaseRole.css" />
