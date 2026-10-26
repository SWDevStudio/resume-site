<template>
  <div
    class="home-hero-night"
    aria-hidden="true"
  >
    <img
      v-hero-image-fade="starsImage"
      class="home-hero-sky"
      :src="starsImage"
      alt=""
    />
    <div class="home-hero-scene">
      <img
        v-hero-image-fade="forestImage"
        class="home-hero-forest"
        :src="forestImage"
        alt=""
      />
      <img
        v-hero-image-fade="gateImage"
        class="home-hero-gate"
        :src="gateImage"
        alt=""
      />
    </div>

    <HeroFloor />

    <div class="home-hero-scene">
      <span class="home-hero-pool" />
      <img
        v-hero-image-fade="gateImage"
        class="home-hero-reflection"
        :src="gateImage"
        alt=""
      />
    </div>

    <span class="home-hero-horizon" />

    <div class="home-hero-scene">
      <span class="home-hero-lamp-pool home-hero-lamp-pool-left" />
      <span class="home-hero-lamp-pool home-hero-lamp-pool-right" />
      <span class="home-hero-lamp-beam home-hero-lamp-beam-left" />
      <span class="home-hero-lamp-beam home-hero-lamp-beam-right" />
      <img
        v-hero-image-fade="lanternImage"
        class="home-hero-lantern home-hero-lantern-left"
        :src="lanternImage"
        alt=""
      />
      <img
        v-hero-image-fade="lanternImage"
        class="home-hero-lantern home-hero-lantern-right"
        :src="lanternImage"
        alt=""
      />
    </div>

    <img
      v-hero-image-fade="pineLeftImage"
      class="home-hero-pine home-hero-pine-left"
      :src="pineLeftImage"
      alt=""
    />
    <img
      v-hero-image-fade="pineRightImage"
      class="home-hero-pine home-hero-pine-right"
      :src="pineRightImage"
      alt=""
    />

    <div class="home-hero-fireflies">
      <span
        v-for="firefly in fireflies"
        :key="firefly.key"
        class="home-hero-firefly"
        :class="firefly.class"
        :style="firefly.style"
      />
    </div>

    <span class="home-hero-scrim" />
  </div>
</template>

<script setup lang="ts">
import HeroFloor from "./HeroFloor.vue";
import { fireflies } from "./heroDecor";
import { vHeroImageFade } from "./heroImageFade";
import starsImage from "./media/stars-torii-synth.svg";
import forestImage from "./media/forest-torii-synth.svg";
import gateImage from "./media/gate-torii-synth.svg";
import lanternImage from "./media/lantern-torii-synth.svg";
import pineLeftImage from "./media/pine-left-torii-synth.svg";
import pineRightImage from "./media/pine-right-torii-synth.svg";
</script>

<style src="./HeroNight.css" />
