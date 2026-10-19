<template>
  <div
    class="home-about-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="item.entry.layer"
    >
      <span class="home-about-glow home-about-glow-a" />
      <span class="home-about-glow home-about-glow-b" />
      <span class="home-about-pattern" />
    </div>
    <img
      v-for="item in layers"
      :key="item.theme"
      class="home-about-crane"
      :class="item.entry.image"
      :src="item.entry.src"
      alt=""
    />
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";
import craneDay from "./media/crane-cyber-sakura.webp";
import craneNight from "./media/crane-torii-synth.webp";

const { layers } = useThemeLayers({
  "torii-synth": { layer: "home-about-night", image: "home-about-crane-night", src: craneNight },
  "cyber-sakura": { layer: "home-about-day", image: "home-about-crane-day", src: craneDay },
});
</script>

<style src="./AboutDecor.css" />
