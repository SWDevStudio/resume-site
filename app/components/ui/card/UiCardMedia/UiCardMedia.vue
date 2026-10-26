<template>
  <div class="card-media">
    <div class="card-media-inner">
      <img
        v-if="src"
        class="card-media-image"
        :srcset="srcset"
        :sizes="sizes"
        :src="src"
        :alt="alt"
        loading="lazy"
        decoding="async"
      />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
  }>(),
  { src: undefined, srcset: undefined, sizes: undefined, alt: "" },
);
</script>
