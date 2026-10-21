<template>
  <UiButton
    class="home-projects-all"
    :to="Route.projects"
  >
    {{ t("home.projects.all") }}
    <UiIcon
      name="arrow-right"
      class="home-projects-all-icon"
    />
  </UiButton>
</template>

<script setup lang="ts">
import { Route } from "~/assets/const";
import { useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";

const { t } = useI18n();
</script>

<style src="./ProjectsAll.css" />
