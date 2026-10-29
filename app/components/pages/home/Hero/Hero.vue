<template>
  <HomeSlide
    id="top"
    ref="root"
    class="home-hero"
    :contained="false"
  >
    <component
      :is="item.entry"
      v-for="item in sceneLayers"
      :key="item.theme"
      :class="item.class"
    />

    <h1 class="home-hero-name">{{ name }}</h1>

    <p
      class="home-hero-title"
      lang="en"
      data-atom-skip
    >
      <span class="home-hero-title-top">Fullstack</span>
      <span class="home-hero-title-bottom">Developer</span>
    </p>

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
import { computed, useTemplateRef, type ComponentPublicInstance } from "vue";
import { useHead } from "#imports";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { useI18n } from "vue-i18n";
import { Route } from "~/assets/const";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useLocale } from "~/composables/useLocale";
import { useDecorMotion } from "~/composables/useDecorMotion";
import { useThemeLayers } from "~/composables/useThemeLayers";
import HeroDay from "./HeroDay.vue";
import HeroNight from "./HeroNight.vue";
import HeroSocials from "./HeroSocials.vue";
import { HERO_IMAGE_FADE_NOSCRIPT } from "./heroImageFade";

defineProps<{
  name: string;
}>();

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

const heroSlide = useTemplateRef<ComponentPublicInstance>("root");
const { paused } = useDecorMotion(heroSlide);

const sceneLayers = computed(() =>
  layers.value.map((item) => ({
    theme: item.theme,
    entry: item.entry,
    class: {
      "decor-paused": item.paused || paused.value,
      "home-hero-late": item.late,
    },
  })),
);
</script>

<style src="./Hero.css" />
