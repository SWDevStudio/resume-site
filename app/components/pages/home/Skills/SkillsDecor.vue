<template>
  <div
    class="home-skills-decor"
    aria-hidden="true"
  >
    <div
      v-for="item in layers"
      :key="item.theme"
      :class="[item.entry.layer, { 'home-skills-late': item.late }]"
    >
      <span class="home-skills-glow home-skills-glow-a" />
      <span class="home-skills-glow home-skills-glow-b" />
      <span class="home-skills-pattern" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeLayers } from "~/composables/useThemeLayers";

const { layers } = useThemeLayers({
  "torii-synth": { layer: "home-skills-night" },
  "cyber-sakura": { layer: "home-skills-day" },
});
</script>

<style src="./SkillsDecor.css" />
