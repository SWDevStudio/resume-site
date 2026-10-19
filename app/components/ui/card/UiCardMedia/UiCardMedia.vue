<template>
  <div class="card-media">
    <div class="card-media-inner">
      <img
        v-if="src"
        class="card-media-image"
        :src="src"
        :alt="alt"
      />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
  }>(),
  { src: undefined, alt: "" },
);
</script>
