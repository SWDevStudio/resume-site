<template>
  <HomeSlide
    id="top"
    class="home-hero"
    :contained="false"
  >
    <component
      :is="item.entry"
      v-for="item in items"
      :key="item.theme"
      :class="{ 'home-hero-paused': item.paused, 'home-hero-late': item.late }"
    />

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
      :href="resumeHref"
      download=""
      target="_blank"
    >
      <UiIcon
        name="arrow-down"
        class="home-hero-cta-icon"
      />
      {{ t("home.hero.cv") }}
    </UiButton>
  </HomeSlide>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "#imports";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useLocale } from "~/composables/useLocale";
import { useThemeLayers } from "~/composables/useThemeLayers";
import HeroDay from "./HeroDay.vue";
import HeroNight from "./HeroNight.vue";
import HeroSocials from "./HeroSocials.vue";
import { HERO_IMAGE_FADE_NOSCRIPT } from "./heroImageFade";

const { t } = useI18n();
const { locale } = useLocale();
const resumeHref = computed(() => Route.resumePdf(locale.value));

useHead({
  noscript: [{ innerHTML: HERO_IMAGE_FADE_NOSCRIPT }],
});

const { layers } = useThemeLayers({
  "torii-synth": HeroNight,
  "cyber-sakura": HeroDay,
});

const initialThemes = layers.value.map((item) => item.theme);
const items = computed(() =>
  layers.value.map((item) => ({ ...item, late: !initialThemes.includes(item.theme) })),
);
</script>

<style src="./Hero.css" />
