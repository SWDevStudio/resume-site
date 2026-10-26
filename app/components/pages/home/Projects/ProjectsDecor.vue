<template>
  <div
    class="home-projects-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="[item.entry.layer, { 'home-projects-late': item.late }]"
    >
      <span class="home-projects-glow" />
      <span class="home-projects-pattern home-projects-pattern-a" />
      <span class="home-projects-pattern home-projects-pattern-b" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";

const { layers } = useThemeLayers({
  "torii-synth": { layer: "home-projects-night" },
  "cyber-sakura": { layer: "home-projects-day" },
});
</script>

<style src="./ProjectsDecor.css" />
