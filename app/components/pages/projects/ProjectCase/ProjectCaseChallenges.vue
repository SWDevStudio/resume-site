<template>
  <div class="project-case-challenges">
    <PageSection
      v-for="item in items"
      :id="item.id"
      :key="item.id"
      class="project-case-challenge project-case-frame project-case-frame-tone project-case-frame-hoverable"
      :class="item.toneClass"
      :name="item.name"
      :label="item.index"
    >
      <dl class="project-case-challenge-rows">
        <div
          v-for="row in item.rows"
          :key="row.key"
          class="project-case-challenge-row"
        >
          <dt class="project-case-challenge-term">{{ row.label }}</dt>
          <dd class="project-case-challenge-text">{{ row.text }}</dd>
        </div>
      </dl>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import PageSection from "~/components/pages/shared/PageSections/PageSection.vue";
import { pageToneClass, type PageTone } from "~/components/pages/shared/pageTone";
import type { ProjectCaseChallengesData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseChallengesData;
}>();

const { t } = useI18n();

const TONES: PageTone[] = ["primary", "secondary", "accent"];

const items = computed(() =>
  props.data.items.map((item, position) => ({
    id: item.id,
    name: item.name,
    index: String(position + 1).padStart(2, "0"),
    toneClass: pageToneClass(TONES[position % TONES.length]!),
    rows: item.rows.map((row) => ({
      key: row.key,
      label: t(`projects.case.challenge.${row.key}`),
      text: row.text,
    })),
  })),
);
</script>

<style src="./ProjectCaseChallenges.css" />
