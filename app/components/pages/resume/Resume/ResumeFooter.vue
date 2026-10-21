<template>
  <footer class="resume-footer">
    <span>{{ copyright }}</span>
    <a
      class="resume-footer-top"
      :href="Route.top"
    >
      {{ t("footer.top") }}
      <UiIcon
        name="arrow-up"
        class="resume-footer-icon"
      />
    </a>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";

defineProps<{
  copyright: string;
}>();

const { t } = useI18n();
</script>

<style src="./ResumeFooter.css" />
