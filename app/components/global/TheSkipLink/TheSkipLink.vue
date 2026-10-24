<template>
  <UiButton
    class="the-skip-link btn-gradient btn-sm"
    :href="href"
  >
    {{ t("layout.skipLink") }}
  </UiButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import UiButton from "~/components/ui/UiButton/UiButton.vue";

const props = defineProps<{
  target: string;
}>();

const { t } = useI18n();

const href = computed(() => Route.anchor(props.target));
</script>

<style src="./TheSkipLink.css" />
