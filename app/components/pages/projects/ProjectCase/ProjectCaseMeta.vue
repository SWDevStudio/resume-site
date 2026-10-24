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
    <div
      v-if="hasStack"
      class="project-case-stack"
    >
      <p class="project-case-stack-label">{{ t("projects.case.stack") }}:</p>
      <ul
        class="project-case-stack-list"
        lang="en"
        data-atom-skip
      >
        <li
          v-for="item in items"
          :key="item.label"
        >
          <UiBadge
            class="project-case-stack-item"
            :class="item.classes"
          >
            <span
              v-if="item.own"
              class="project-case-stack-dot"
              aria-hidden="true"
            />
            {{ item.label }}
          </UiBadge>
        </li>
      </ul>
      <p
        v-if="hasOwn"
        class="project-case-stack-legend"
      >
        <span
          class="project-case-stack-dot"
          aria-hidden="true"
        />
        {{ t("projects.case.stackOwn") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";
import type { ProjectCaseMetaData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseMetaData;
}>();

const { t } = useI18n();

const items = computed(() =>
  props.data.stack.map((item) => ({
    label: item.label,
    own: Boolean(item.own),
    classes: { "badge-primary project-case-stack-own": item.own },
  })),
);
const hasStack = computed(() => props.data.stack.length > 0);
const hasOwn = computed(() => props.data.stack.some((item) => item.own));
</script>

<style src="./ProjectCaseMeta.css" />
