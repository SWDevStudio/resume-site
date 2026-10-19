<template>
  <a
    class="the-footer-top"
    href="#top"
  >
    {{ t("footer.top") }}
    <svg
      class="the-footer-top-icon"
      viewBox="0 0 12 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path d="M6 15V2M1 7L6 2L11 7" />
    </svg>
  </a>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style src="./TheFooterTop.css" />
