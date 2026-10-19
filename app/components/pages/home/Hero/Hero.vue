<template>
  <HomeSlide
    id="top"
    class="home-hero"
    :contained="false"
  >
    <HeroNight />
    <HeroDay />

    <h1
      class="home-hero-title"
      lang="en"
      data-atom-skip
    >
      <span class="home-hero-title-top">Fullstack</span>
      <span class="home-hero-title-bottom">Developer</span>
    </h1>

    <HeroSocials />

    <UiButton
      class="home-hero-cta btn-lg"
      type="button"
    >
      <span
        class="home-hero-cta-icon"
        aria-hidden="true"
      />
      {{ t("home.hero.cv") }}
    </UiButton>
  </HomeSlide>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import HeroDay from "./HeroDay.vue";
import HeroNight from "./HeroNight.vue";
import HeroSocials from "./HeroSocials.vue";

const { t } = useI18n();
</script>

<style src="./Hero.css" />
