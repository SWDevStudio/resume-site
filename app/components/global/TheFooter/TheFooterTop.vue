<template>
  <a
    class="the-footer-top"
    href="#top"
  >
    {{ t("footer.top") }}
    <UiIcon
      name="arrow-up"
      class="the-footer-top-icon"
    />
  </a>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style src="./TheFooterTop.css" />
