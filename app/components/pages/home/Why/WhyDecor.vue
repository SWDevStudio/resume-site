<template>
  <div
    class="home-why-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="item.entry.layer"
    >
      <span class="home-why-glow home-why-glow-a" />
      <span class="home-why-glow home-why-glow-b" />
      <span class="home-why-pattern" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";

const { layers } = useThemeLayers({
  "torii-synth": { layer: "home-why-night" },
  "cyber-sakura": { layer: "home-why-day" },
});
</script>

<style src="./WhyDecor.css" />
