<template>
  <div class="error-page container">
    <header
      id="top"
      class="error-page-header"
    >
      <span class="error-page-eyebrow">{{ t("error.eyebrow") }}</span>
      <p
        class="error-page-code"
        lang="en"
        data-atom-skip
      >
        {{ status }}
      </p>
      <h1 class="error-page-title">
        {{ t(titleKey) }}
        <span class="error-page-title-accent">{{ t(accentKey) }}</span>
      </h1>
      <p class="error-page-lead">{{ t(textKey) }}</p>
    </header>
    <UiButton
      class="error-page-home btn-gradient"
      :to="Route.home"
    >
      {{ t("error.home") }}
      <UiIcon
        name="arrow-right"
        class="error-page-home-icon"
      />
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";

const props = defineProps<{
  status: number;
  kind: "notFound" | "generic";
}>();

const { t } = useI18n();

const titleKey = computed(() => `error.${props.kind}.title`);
const accentKey = computed(() => `error.${props.kind}.titleAccent`);
const textKey = computed(() => `error.${props.kind}.text`);
</script>

<style src="./ErrorPage.css" />
