<template>
  <div class="the-footer-brand">
    <a
      class="the-footer-logo"
      href="#top"
    >
      <span>SW</span>
      <span class="the-footer-logo-dash">-</span>
      <span>DEV</span>
    </a>
    <span class="the-footer-tagline">{{ t("footer.tagline") }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style src="./TheFooterBrand.css" />
