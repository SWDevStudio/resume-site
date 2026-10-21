<template>
  <HomeSlide
    id="why"
    class="home-why"
  >
    <template #backdrop>
      <WhyDecor />
    </template>

    <div class="home-why-main">
      <div class="home-why-head">
        <span class="home-why-label">{{ t("home.why.label") }}</span>
        <h2 class="home-why-title">
          {{ t("home.why.titleTop") }}
          <span class="home-why-accent">{{ t("home.why.titleAccent") }}</span>
        </h2>
      </div>

      <div class="home-why-stage">
        <WhyWindow />
        <WhyOwl />
      </div>
    </div>
  </HomeSlide>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HomeSlide from "~/components/pages/home/HomeSlide/HomeSlide.vue";
import WhyDecor from "./WhyDecor.vue";
import WhyOwl from "./WhyOwl.vue";
import WhyWindow from "./WhyWindow.vue";

const { t } = useI18n();
</script>

<style src="./Why.css" />
