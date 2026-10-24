<template>
  <dl class="resume-contacts">
    <template
      v-for="contact in contacts"
      :key="contact.id"
    >
      <dt class="resume-contacts-label">{{ contact.label }}</dt>
      <dd class="resume-contacts-value">
        <ResumeLink
          v-if="contact.href"
          :href="contact.href"
          :label="contact.value"
        />
        <template v-else>{{ contact.value }}</template>
      </dd>
    </template>
  </dl>
</template>

<script setup lang="ts">
import ResumeLink from "./ResumeLink.vue";
import type { ResumeContact } from "~/assets/api/types/resume";

defineProps<{
  contacts: ResumeContact[];
}>();
</script>

<style src="./ResumeContacts.css" />
