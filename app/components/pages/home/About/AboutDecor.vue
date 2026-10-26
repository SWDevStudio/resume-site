<template>
  <div
    class="home-about-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="[item.entry.layer, { 'home-about-late': item.late }]"
    >
      <span class="home-about-glow home-about-glow-a" />
      <span class="home-about-glow home-about-glow-b" />
      <span class="home-about-pattern" />
    </div>
    <img
      v-for="item in layers"
      :key="item.theme"
      class="home-about-crane"
      :class="[item.entry.image, { 'home-about-late': item.late }]"
      v-bind="item.entry.media"
      alt=""
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";
import { decorImage } from "~/components/pages/home/decorImage";
import craneDay from "./media/crane-cyber-sakura.webp?w=200;332&as=img";
import craneNight from "./media/crane-torii-synth.webp?w=200;360;520&as=img";

const { layers } = useThemeLayers({
  "torii-synth": {
    layer: "home-about-night",
    image: "home-about-crane-night",
    media: decorImage(craneNight, 24, 35, 45),
  },
  "cyber-sakura": {
    layer: "home-about-day",
    image: "home-about-crane-day",
    media: decorImage(craneDay, 25.5, 37, 47.5),
  },
});
</script>

<style src="./AboutDecor.css" />
