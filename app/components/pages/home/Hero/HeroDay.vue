<template>
  <div
    class="home-hero-day"
    aria-hidden="true"
  >
    <img
      v-hero-image-fade="cloudsHighImage"
      class="home-hero-sky"
      :src="cloudsHighImage"
      alt=""
    />
    <div class="home-hero-scene">
      <img
        v-hero-image-fade="fujiImage"
        class="home-hero-fuji"
        :src="fujiImage"
        alt=""
      />
    </div>
    <img
      v-hero-image-fade="cloudsLowImage"
      class="home-hero-sky"
      :src="cloudsLowImage"
      alt=""
    />

    <HeroFloor />

    <span class="home-hero-horizon" />

    <img
      v-hero-image-fade="branchLarge.src"
      class="home-hero-branch home-hero-branch-large"
      v-bind="branchLarge"
      alt=""
    />
    <img
      v-hero-image-fade="branchCorner.src"
      class="home-hero-branch home-hero-branch-corner"
      v-bind="branchCorner"
      alt=""
    />
    <img
      v-hero-image-fade="branchLow.src"
      class="home-hero-branch home-hero-branch-low"
      v-bind="branchLow"
      alt=""
      loading="lazy"
      decoding="async"
    />

    <div class="home-hero-petals">
      <span
        v-for="petal in petals"
        :key="petal.key"
        class="home-hero-petal"
        :class="petal.class"
        :style="petal.style"
      >
        <span
          class="home-hero-petal-leaf"
          :class="petal.leafClass"
        />
      </span>
    </div>

    <span class="home-hero-scrim" />
  </div>
</template>

<script setup lang="ts">
import HeroFloor from "./HeroFloor.vue";
import { petals } from "./heroDecor";
import { vHeroImageFade } from "./heroImageFade";
import { decorImage } from "~/components/pages/home/decorImage";
import branchLargeImage from "./media/branch-large-cyber-sakura.webp?w=420;640;763&as=img";
import branchCornerImage from "./media/branch-corner-cyber-sakura.webp?w=200;293&as=img";
import branchLowImage from "./media/branch-low-cyber-sakura.webp?w=280;400;530&as=img";
import cloudsHighImage from "./media/clouds-high-cyber-sakura.svg";
import fujiImage from "./media/fuji-cyber-sakura.svg";
import cloudsLowImage from "./media/clouds-low-cyber-sakura.svg";

const branchLarge = decorImage(branchLargeImage, 52.5, 85, 104.5);
const branchCorner = decorImage(branchCornerImage, 27.5, 47.5, 52.5);
const branchLow = decorImage(branchLowImage, 57.5, 57.5, 67.25);
</script>

<style src="./HeroDay.css" />
