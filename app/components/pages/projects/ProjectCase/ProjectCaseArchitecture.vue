<template>
  <ul
    class="project-case-architecture"
    :class="toneClass"
  >
    <li
      v-for="item in items"
      :key="item.label"
      class="project-case-architecture-item project-case-frame project-case-frame-field project-case-frame-tone project-case-frame-hoverable"
      :class="item.wideClass"
    >
      <span
        class="project-case-architecture-label"
        lang="en"
        data-atom-skip
      >
        {{ item.label }}
      </span>
      <span class="project-case-architecture-title">{{ item.title }}</span>
      <p
        v-if="item.text"
        class="project-case-architecture-text"
      >
        {{ item.text }}
      </p>
      <ul
        v-if="item.code"
        class="project-case-architecture-codes"
      >
        <li
          v-for="code in item.code"
          :key="code"
        >
          <code
            class="project-case-architecture-code"
            lang="en"
            data-atom-skip
          >
            {{ code }}
          </code>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { pageToneClass } from "~/components/pages/shared/pageTone";
import type { ProjectCaseArchitectureData } from "~/assets/api/types/projectCase";

const props = defineProps<{
  data: ProjectCaseArchitectureData;
}>();

const items = computed(() =>
  props.data.items.map((item) => ({
    ...item,
    wideClass: item.wide ? "project-case-architecture-item-wide" : null,
  })),
);

const toneClass = pageToneClass("accent");
</script>

<style src="./ProjectCaseArchitecture.css" />
