<template>
  <header class="project-case-header">
    <NuxtLinkLocale
      class="project-case-back"
      :to="Route.projects"
    >
      <UiIcon
        name="arrow-right"
        class="project-case-back-icon"
      />
      {{ t("projects.case.back") }}
    </NuxtLinkLocale>
    <div class="project-case-head-row">
      <span class="project-case-label">{{ label }}</span>
      <UiButton
        class="project-case-live btn-ghost"
        :href="liveHref"
        :aria-disabled="liveDisabled"
        target="_blank"
      >
        {{ t("projects.case.liveSite") }}
        <UiIcon
          name="external"
          class="project-case-live-icon"
        />
      </UiButton>
    </div>
    <h1 class="project-case-title">
      <span
        lang="en"
        data-atom-skip
      >
        {{ title }}
      </span>
      <span class="project-case-headline">{{ data.headline }}</span>
    </h1>
  </header>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { Route } from "~/assets/const";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { ProjectCaseHeaderData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseHeaderData;
}>();

const { t } = useI18n();

const label = computed(() => `${props.data.index} · ${props.data.subtitle}`);
const title = computed(() => `${props.data.name}: `);
const liveHref = computed(() => props.data.url ?? null);
const liveDisabled = computed(() => (props.data.url ? undefined : "true"));
</script>

<style src="./ProjectCaseHeader.css" />
