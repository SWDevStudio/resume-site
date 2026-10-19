<template>
  <div class="home-contact-socials">
    <a
      v-for="social in items"
      :key="social.key"
      class="home-contact-social"
      :class="social.class"
      :href="social.href"
      :aria-label="social.label"
      target="_blank"
      rel="noopener noreferrer"
    />
  </div>
</template>

<script setup lang="ts">
import { socials } from "~/components/pages/home/Hero/heroSocials";

const items = socials.map((social) => ({
  ...social,
  class: `home-contact-social-${social.key}`,
}));
</script>

<style src="./ContactSocials.css" />
