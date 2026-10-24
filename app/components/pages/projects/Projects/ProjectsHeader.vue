<template>
  <header
    id="top"
    class="projects-header"
  >
    <span class="projects-eyebrow">{{ t("projects.page.eyebrow") }}</span>
    <h1 class="projects-title">
      {{ t("projects.page.title") }}
      <span class="projects-title-accent">{{ t("projects.page.titleAccent") }}</span>
    </h1>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style src="./ProjectsHeader.css" />
