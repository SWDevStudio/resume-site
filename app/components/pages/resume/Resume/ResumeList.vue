<template>
  <ul class="resume-list">
    <li
      v-for="(item, index) in entries"
      :key="index"
      class="resume-list-item"
    >
      <b
        v-if="item.lead"
        class="resume-list-lead"
        :lang="item.lang"
        :data-atom-skip="item.skip"
      >
        {{ item.lead }}
      </b>
      <span
        :lang="item.lang"
        :data-atom-skip="item.skip"
      >
        {{ item.text }}
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResumeListEntry } from "~/assets/api/types/resume";

const props = defineProps<{
  items: (string | ResumeListEntry)[];
  term?: boolean;
}>();

const entries = computed(() =>
  props.items.map((item) => {
    const source = typeof item === "string" ? { text: item } : item;
    const term = source.term ?? props.term ?? false;
    return {
      lead: source.lead,
      text: source.lead && source.text ? ` ${source.text}` : source.text,
      lang: term ? "en" : undefined,
      skip: term ? "" : undefined,
    };
  }),
);
</script>

<style src="./ResumeList.css" />
