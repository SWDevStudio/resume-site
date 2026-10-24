<template>
  <div class="project-case-integrations">
    <ul class="project-case-integrations-list">
      <li
        v-for="item in items"
        :key="item.label"
      >
        <UiBadge
          class="project-case-integration"
          :class="item.classes"
          v-bind="item.attrs"
        >
          <span
            v-if="item.own"
            class="project-case-integration-dot"
            aria-hidden="true"
          />
          {{ item.label }}
        </UiBadge>
      </li>
    </ul>
    <p
      v-if="hasOwn"
      class="project-case-integrations-legend"
    >
      <span
        class="project-case-integration-dot"
        aria-hidden="true"
      />
      {{ t("projects.case.integrations.own") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";
import type { ProjectCaseIntegrationsData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseIntegrationsData;
}>();

const { t } = useI18n();

const TERM_ATTRS = { lang: "en", "data-atom-skip": "" };

const items = computed(() =>
  props.data.items.map((item) => ({
    label: item.label,
    own: Boolean(item.own),
    classes: { "badge-primary project-case-integration-own": item.own },
    attrs: item.term ? TERM_ATTRS : {},
  })),
);
const hasOwn = computed(() => props.data.items.some((item) => item.own));
</script>

<style src="./ProjectCaseIntegrations.css" />
