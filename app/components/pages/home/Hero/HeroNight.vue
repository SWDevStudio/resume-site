<template>
  <div
    class="home-hero-night"
    aria-hidden="true"
  >
    <img
      class="home-hero-sky"
      src="./media/stars-torii-synth.svg"
      alt=""
    />
    <div class="home-hero-scene">
      <img
        class="home-hero-forest"
        src="./media/forest-torii-synth.svg"
        alt=""
      />
      <img
        class="home-hero-gate"
        src="./media/gate-torii-synth.svg"
        alt=""
      />
    </div>

    <HeroFloor />

    <div class="home-hero-scene">
      <span class="home-hero-pool" />
      <img
        class="home-hero-reflection"
        src="./media/gate-torii-synth.svg"
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
        class="home-hero-lantern home-hero-lantern-left"
        src="./media/lantern-torii-synth.svg"
        alt=""
      />
      <img
        class="home-hero-lantern home-hero-lantern-right"
        src="./media/lantern-torii-synth.svg"
        alt=""
      />
    </div>

    <img
      class="home-hero-pine home-hero-pine-left"
      src="./media/pine-left-torii-synth.svg"
      alt=""
    />
    <img
      class="home-hero-pine home-hero-pine-right"
      src="./media/pine-right-torii-synth.svg"
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
</script>

<style src="./HeroNight.css" />
