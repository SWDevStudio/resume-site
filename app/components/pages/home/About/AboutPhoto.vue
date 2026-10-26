<template>
  <div class="home-about-photo">
    <span
      class="home-about-photo-edge"
      aria-hidden="true"
    />
    <div class="home-about-photo-frame">
      <img
        class="home-about-photo-image"
        src="./media/photo.webp"
        :alt="t('home.about.photoAlt')"
        loading="lazy"
        decoding="async"
      />
      <span
        class="home-about-photo-tint"
        aria-hidden="true"
      />
      <span
        class="home-about-photo-shade"
        aria-hidden="true"
      />
    </div>
    <UiBadge class="home-about-status badge-ghost">
      <span
        class="home-about-status-dot status status-secondary"
        aria-hidden="true"
      />
      {{ t("home.about.status") }}
    </UiBadge>
    <span
      class="home-about-photo-corner"
      aria-hidden="true"
    />
    <span
      class="home-about-photo-bar"
      aria-hidden="true"
    />
    <span
      v-for="petal in petals"
      :key="petal.key"
      class="home-about-petal"
      :style="petal.style"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";
import { petals } from "./aboutPetals";

const { t } = useI18n();
</script>

<style src="./AboutPhoto.css" />
