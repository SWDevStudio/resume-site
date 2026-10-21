<template>
  <header class="resume-header">
    <span class="resume-caption">{{ profile.caption }}</span>
    <h1 class="resume-title">
      {{ profile.firstName }}
      <span class="resume-title-accent">{{ profile.lastName }}</span>
    </h1>
    <p class="resume-role">
      {{ profile.role }}
      <span
        class="resume-role-stack"
        lang="en"
        data-atom-skip
      >
        {{ stack }}
      </span>
      <br />
      <span class="resume-role-focus">{{ profile.specialization }}</span>
    </p>
    <ResumeActions />
    <div
      class="resume-rule"
      aria-hidden="true"
    />
    <ResumeContacts :contacts="profile.contacts" />
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ResumeActions from "./ResumeActions.vue";
import ResumeContacts from "./ResumeContacts.vue";
import type { ResumeProfile } from "#shared/types/resume";

const props = defineProps<{
  profile: ResumeProfile;
}>();

const stack = computed(() => `(${props.profile.stack.join(" / ")})`);
</script>

<style src="./ResumeHeader.css" />
