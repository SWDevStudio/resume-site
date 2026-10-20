<template>
  <div class="the-footer-brand">
    <a
      class="the-footer-logo"
      :href="Route.top"
    >
      <span>SOWA</span>
      <span class="the-footer-logo-dash">_</span>
      <span>DEV</span>
    </a>
    <span class="the-footer-tagline">
      <span
        lang="en"
        data-atom-skip
      >
        Fullstack developer
      </span>
      · {{ t("footer.tagline") }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";

const { t } = useI18n();
</script>

<style src="./TheFooterBrand.css" />
