<template>
  <ResumeList
    class="resume-list-loose"
    :items="rows"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResumeData } from "#shared/types/resume";
import ResumeList from "./ResumeList.vue";

const props = defineProps<{
  skills: ResumeData["skills"];
}>();

const rows = computed(() =>
  props.skills.groups.map((group) => ({
    lead: `${group.name}:`,
    text: group.skills.map((skill) => skill.name).join(", "),
    term: group.terms,
  })),
);
</script>
