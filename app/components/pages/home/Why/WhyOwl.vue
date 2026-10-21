<template>
  <img
    v-for="item in layers"
    :key="item.theme"
    class="home-why-owl"
    :class="item.entry.image"
    :src="item.entry.src"
    alt=""
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";
import owlDay from "./media/owl-cyber-sakura.webp";
import owlNight from "./media/owl-torii-synth.webp";

const { layers } = useThemeLayers({
  "torii-synth": { image: "home-why-owl-night", src: owlNight },
  "cyber-sakura": { image: "home-why-owl-day", src: owlDay },
});
</script>

<style src="./WhyOwl.css" />
