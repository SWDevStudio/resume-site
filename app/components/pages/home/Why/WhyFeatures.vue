<template>
  <div class="home-why-features">
    <UiFeature
      v-for="item in features"
      :key="item.key"
      class="home-why-feature"
      :class="item.class"
      :data="item.data"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { FeatureData } from "~/components/ui/card/types";
import UiFeature from "~/components/ui/UiFeature/UiFeature.vue";

const FEATURES = [
  { key: "autonomy", tone: "primary" },
  { key: "performance", tone: "accent" },
] as const;

const { t } = useI18n();

const features = computed(() =>
  FEATURES.map((item, index) => ({
    key: item.key,
    class: `home-why-feature-${item.tone}`,
    data: {
      index: String(index + 1).padStart(2, "0"),
      title: t(`home.why.features.${item.key}.title`),
      label: t("home.why.features.label"),
      prompt: t(`home.why.features.${item.key}.prompt`),
    } satisfies FeatureData,
  })),
);
</script>

<style src="./WhyFeatures.css" />
