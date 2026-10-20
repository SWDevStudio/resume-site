<template>
  <HomeSlide
    id="about"
    class="home-about"
  >
    <template #backdrop>
      <AboutDecor />
    </template>

    <div class="home-about-grid">
      <div class="home-about-text">
        <span class="home-about-label">{{ t("home.about.label") }}</span>
        <div class="home-about-heading">
          <h2 class="home-about-title">
            {{ t("home.about.greeting") }}
            <span class="home-about-name">{{ t("home.about.name") }}</span>
          </h2>
          <p
            class="home-about-role"
            lang="en"
            data-atom-skip
          >
            Fullstack Developer.
          </p>
        </div>
        <p class="home-about-description">{{ t("home.about.description") }}</p>
        <AboutActions />
      </div>
      <AboutPhoto />
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import AboutActions from "./AboutActions.vue";
import AboutDecor from "./AboutDecor.vue";
import AboutPhoto from "./AboutPhoto.vue";

const { t } = useI18n();
</script>

<style src="./About.css" />
