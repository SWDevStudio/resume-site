<template>
  <div
    class="home-contact-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="[item.entry.layer, { 'home-contact-late': item.late }]"
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
      :class="[item.entry.image, { 'home-contact-late': item.late }]"
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
import koiDay from "./media/koi-cyber-sakura.webp?w=200;316&as=img";
import koiNight from "./media/koi-torii-synth.webp?w=200;320;460&as=img";

const { layers } = useThemeLayers({
  "torii-synth": {
    layer: "home-contact-night",
    image: "home-contact-koi-night",
    media: decorImage(koiNight, 27, 35, 37.5),
  },
  "cyber-sakura": {
    layer: "home-contact-day",
    image: "home-contact-koi-day",
    media: decorImage(koiDay, 28.5, 37, 40),
  },
});
</script>

<style src="./ContactDecor.css" />
