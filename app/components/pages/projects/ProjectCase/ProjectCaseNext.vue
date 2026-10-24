<template>
  <footer class="project-case-footer">
    <NuxtLinkLocale
      class="project-case-next project-case-tone"
      :class="toneClass"
      :to="href"
    >
      <span class="project-case-next-box">
        <span class="project-case-next-text">
          <span class="project-case-next-label">{{ label }}</span>
          <span
            class="project-case-next-name"
            lang="en"
            data-atom-skip
          >
            {{ data.name }}
          </span>
        </span>
        <UiIcon
          name="arrow-right"
          class="project-case-next-icon"
        />
      </span>
    </NuxtLinkLocale>
  </footer>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { Route } from "~/assets/const";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { ProjectCaseNextData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseNextData;
}>();

const { t } = useI18n();

const href = computed(() => Route.project(props.data.slug));
const toneClass = computed(() => [
  `project-case-tone-${props.data.tone}`,
  ...pageToneClass(props.data.tone),
]);
const label = computed(() => `${t("projects.case.next")} · ${props.data.index}`);
</script>

<style src="./ProjectCaseNext.css" />
