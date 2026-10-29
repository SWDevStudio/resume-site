<template>
  <div class="resume-projects">
    <article
      v-for="entry in entries"
      :key="entry.id"
      class="resume-project"
    >
      <h3 class="resume-project-title">
        <span
          class="resume-project-name"
          lang="en"
          data-atom-skip
        >
          {{ entry.name }}
        </span>
      </h3>
      <span
        v-if="entry.meta"
        class="resume-project-subtitle"
      >
        {{ entry.meta }}
      </span>
      <p class="resume-text">{{ entry.description }}</p>
      <ResumeList
        v-if="entry.hasPoints"
        class="resume-list-tight"
        :items="entry.points"
      />
      <span
        class="resume-project-subtitle"
        lang="en"
        data-atom-skip
      >
        {{ entry.stackLine }}
      </span>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResumeCase, ResumeData } from "~/assets/api/types/resume";
import ResumeList from "./ResumeList.vue";

const props = defineProps<{
  cases: ResumeData["cases"];
}>();

function caseMeta(entry: ResumeCase) {
  return [entry.period, entry.role].filter(Boolean).join(" · ");
}

const entries = computed(() =>
  props.cases.items.map((entry) => ({
    ...entry,
    meta: caseMeta(entry),
    hasPoints: entry.points.length > 0,
    stackLine: entry.stack.join(", "),
  })),
);
</script>
