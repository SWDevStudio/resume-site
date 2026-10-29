<template>
  <div class="home-about-actions">
    <UiButton
      class="home-about-action"
      type="button"
      @click="scrollTo('contact')"
    >
      <UiIcon
        name="chat"
        class="home-about-action-icon home-about-action-icon-chat"
      />
      {{ t("home.about.contact") }}
    </UiButton>
    <UiButton
      class="home-about-action btn-primary"
      :to="Route.projects"
    >
      <UiIcon
        name="arrow-right"
        class="home-about-action-icon home-about-action-icon-arrow"
      />
      {{ t("home.about.projects") }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import UiButton from "~/components/ui/UiButton/UiButton.vue";

const { t } = useI18n();

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}
</script>

<style src="./AboutActions.css" />
