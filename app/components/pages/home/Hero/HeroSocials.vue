<template>
  <div class="home-hero-rail">
    <span
      class="home-hero-rail-line"
      aria-hidden="true"
    />
    <a
      v-for="social in socials"
      :key="social.key"
      class="home-hero-social"
      :class="social.class"
      :href="social.href"
      :aria-label="social.label"
    />
    <span
      class="home-hero-rail-line"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { socials } from "./heroSocials";
</script>

<style src="./HeroSocials.css" />
