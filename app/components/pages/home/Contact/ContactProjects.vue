<template>
  <UiButton
    class="home-contact-projects btn-block btn-gradient"
    type="button"
    @click="scrollTo('projects')"
  >
    {{ t("home.contact.projects") }}
    <UiIcon
      name="arrow-right"
      class="home-contact-projects-icon"
    />
  </UiButton>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";

const { t } = useI18n();

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}
</script>

<style src="./ContactProjects.css" />
