<template>
  <div class="resume-actions">
    <UiButton
      v-for="action in actions"
      :key="action.id"
      class="resume-action"
      :class="action.class"
      :href="action.href"
      :aria-label="action.ariaLabel"
      :download="action.download"
      target="_blank"
    >
      <span class="resume-action-long">{{ action.label }}</span>
      <span
        class="resume-action-short"
        lang="en"
        data-atom-skip
      >
        {{ action.shortLabel }}
      </span>
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useLocale } from "~/composables/useLocale";

const { t } = useI18n();
const { locale } = useLocale();

const actions = computed(() => [
  {
    id: "pdf",
    class: "resume-action-pdf",
    label: t("resume.actions.pdf"),
    shortLabel: "PDF",
    ariaLabel: t("resume.actions.pdfAria"),
    href: Route.resumePdf(locale.value),
    download: "",
  },
  {
    id: "md",
    class: "resume-action-md",
    label: t("resume.actions.md"),
    shortLabel: "LLM · MD",
    ariaLabel: t("resume.actions.mdAria"),
    href: Route.resumeMarkdown(locale.value),
    download: undefined,
  },
]);
</script>

<style src="./ResumeActions.css" />
