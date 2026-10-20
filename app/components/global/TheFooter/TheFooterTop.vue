<template>
  <button
    type="button"
    class="the-footer-top"
    @click="scrollToTop"
  >
    {{ t("footer.top") }}
    <UiIcon
      name="arrow-up"
      class="the-footer-top-icon"
    />
  </button>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useMediaQuery } from "@vueuse/core";

const { t } = useI18n();
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
const behavior = computed<ScrollBehavior>(() => (reduceMotion.value ? "auto" : "smooth"));

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: behavior.value });
}
</script>

<style src="./TheFooterTop.css" />
