<template>
  <img
    v-for="item in layers"
    :key="item.theme"
    class="home-why-owl"
    :class="[item.entry.image, { 'home-why-owl-late': item.late }]"
    v-bind="item.entry.media"
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
  />
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";
import { decorImage } from "~/components/pages/home/decorImage";
import owlDay from "./media/owl-cyber-sakura.webp?w=200;358&as=img";
import owlNight from "./media/owl-torii-synth.webp?w=200;300;400&as=img";

const { layers } = useThemeLayers({
  "torii-synth": { image: "home-why-owl-night", media: decorImage(owlNight, 28, 35, 35) },
  "cyber-sakura": { image: "home-why-owl-day", media: decorImage(owlDay, 29.75, 37, 43) },
});
</script>

<style src="./WhyOwl.css" />
