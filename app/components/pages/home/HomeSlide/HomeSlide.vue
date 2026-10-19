<template>
  <section
    :id="id"
    class="home-slide"
    :class="slideClass"
  >
    <slot name="backdrop" />
    <div
      v-if="contained"
      class="home-slide-body container"
      :class="bodyClass"
    >
      <slot />
    </div>
    <slot v-else />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    id: string;
    contained?: boolean;
    wide?: boolean;
    short?: boolean;
  }>(),
  { contained: true, wide: false, short: false },
);

const slideClass = computed(() => ({ "home-slide-short": props.short }));

const bodyClass = computed(() => ({ "container-wide": props.wide }));
</script>

<style src="./HomeSlide.css" />
