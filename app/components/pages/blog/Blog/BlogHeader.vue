<template>
  <header
    id="top"
    class="blog-header"
  >
    <span class="blog-eyebrow">{{ t("blog.eyebrow") }}</span>
    <h1 class="blog-title">
      {{ t("blog.title") }}
      <span class="blog-title-accent">{{ t("blog.titleAccent") }}</span>
    </h1>
    <p class="blog-lead">{{ t("blog.lead") }}</p>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style src="./BlogHeader.css" />
