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
        <I18nT
          keypath="home.about.description"
          tag="p"
          class="home-about-description"
        >
          <template
            v-for="term in descriptionTerms"
            :key="term.slot"
            #[term.slot]
          >
            <span
              lang="en"
              data-atom-skip
            >
              {{ term.text }}
            </span>
          </template>
        </I18nT>
        <AboutActions />
      </div>
      <AboutPhoto />
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { I18nT, useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import AboutActions from "./AboutActions.vue";
import AboutDecor from "./AboutDecor.vue";
import AboutPhoto from "./AboutPhoto.vue";

const { t } = useI18n();

const descriptionTerms = [
  { slot: "fullstack", text: "Fullstack" },
  { slot: "frontend", text: "Frontend" },
  { slot: "vue", text: "Vue.js" },
  { slot: "nuxt", text: "Nuxt" },
  { slot: "react", text: "React" },
  { slot: "next", text: "Next.js" },
  { slot: "backend", text: "backend" },
  { slot: "laravel", text: "Laravel" },
  { slot: "nest", text: "NestJS" },
  { slot: "express", text: "Express" },
  { slot: "ai", text: "AI" },
  { slot: "skills", text: "skills" },
];
</script>

<style src="./About.css" />
