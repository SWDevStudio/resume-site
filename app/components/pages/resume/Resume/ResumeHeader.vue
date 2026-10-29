<template>
  <header class="resume-header">
    <span class="resume-caption">{{ profile.caption }}</span>
    <h1 class="resume-title">
      {{ profile.firstName }}
      <span class="resume-title-accent">{{ profile.lastName }}</span>
    </h1>
    <p class="resume-role">
      {{ profile.role }}
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
import ResumeActions from "./ResumeActions.vue";
import ResumeContacts from "./ResumeContacts.vue";
import type { ResumeProfile } from "~/assets/api/types/resume";

defineProps<{
  profile: ResumeProfile;
}>();
</script>

<style src="./ResumeHeader.css" />
