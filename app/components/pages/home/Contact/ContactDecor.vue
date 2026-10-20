<template>
  <div
    class="home-contact-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="item.entry.layer"
    >
      <span class="home-contact-glow home-contact-glow-a" />
      <span class="home-contact-glow home-contact-glow-b" />
      <span class="home-contact-glow home-contact-glow-c" />
      <span class="home-contact-pattern" />
    </div>
    <img
      v-for="item in layers"
      :key="item.theme"
      class="home-contact-koi"
      :class="item.entry.image"
      :src="item.entry.src"
      alt=""
    />
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";
import koiDay from "./media/koi-cyber-sakura.webp";
import koiNight from "./media/koi-torii-synth.webp";

const { layers } = useThemeLayers({
  "torii-synth": { layer: "home-contact-night", image: "home-contact-koi-night", src: koiNight },
  "cyber-sakura": { layer: "home-contact-day", image: "home-contact-koi-day", src: koiDay },
});
</script>

<style src="./ContactDecor.css" />
