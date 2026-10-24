<template>
  <div
    class="home-hero-day"
    aria-hidden="true"
  >
    <img
      v-hero-image-fade
      class="home-hero-sky"
      src="./media/clouds-high-cyber-sakura.svg"
      alt=""
    />
    <div class="home-hero-scene">
      <img
        v-hero-image-fade
        class="home-hero-fuji"
        src="./media/fuji-cyber-sakura.svg"
        alt=""
      />
    </div>
    <img
      v-hero-image-fade
      class="home-hero-sky"
      src="./media/clouds-low-cyber-sakura.svg"
      alt=""
    />

    <HeroFloor />

    <span class="home-hero-horizon" />

    <img
      v-hero-image-fade
      class="home-hero-branch home-hero-branch-large"
      src="./media/branch-large-cyber-sakura.webp"
      alt=""
    />
    <img
      v-hero-image-fade
      class="home-hero-branch home-hero-branch-corner"
      src="./media/branch-corner-cyber-sakura.webp"
      alt=""
    />
    <img
      v-hero-image-fade
      class="home-hero-branch home-hero-branch-low"
      src="./media/branch-low-cyber-sakura.webp"
      alt=""
    />

    <div class="home-hero-petals">
      <span
        v-for="petal in petals"
        :key="petal.key"
        class="home-hero-petal"
        :class="petal.class"
        :style="petal.style"
      >
        <span class="home-hero-petal-sway">
          <span
            class="home-hero-petal-leaf"
            :class="petal.leafClass"
          />
        </span>
      </span>
    </div>

    <span class="home-hero-scrim" />
  </div>
</template>

<script setup lang="ts">
import HeroFloor from "./HeroFloor.vue";
import { petals } from "./heroDecor";
import { vHeroImageFade } from "./heroImageFade";
</script>

<style src="./HeroDay.css" />
