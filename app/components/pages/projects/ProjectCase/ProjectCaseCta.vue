<template>
  <PageSection
    :id="data.id"
    class="project-case-cta"
    :name="data.title"
    :nav-name="t('projects.case.cta.nav')"
    :label="t('projects.case.cta.label')"
  >
    <p class="project-case-cta-text">{{ data.text }}</p>
    <div class="project-case-cta-actions">
      <UiButton
        class="project-case-cta-main btn-gradient"
        :href="telegram"
        target="_blank"
      >
        {{ t("projects.case.cta.telegram") }}
        <UiIcon
          name="arrow-right"
          class="project-case-cta-icon"
        />
      </UiButton>
      <UiButton
        v-if="hasLive"
        class="project-case-cta-live btn-ghost"
        :href="liveHref"
        target="_blank"
      >
        {{ t("projects.case.cta.live") }}
        <UiIcon
          name="external"
          class="project-case-cta-live-icon"
        />
      </UiButton>
    </div>
  </PageSection>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SOCIAL } from "~/assets/const";
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import type { ProjectCaseCtaData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseCtaData;
}>();

const { t } = useI18n();

const telegram = SOCIAL.telegram.href;
const liveHref = computed(() => props.data.url ?? null);
const hasLive = computed(() => Boolean(props.data.url));
</script>

<style src="./ProjectCaseCta.css" />
