<template>
  <button
    class="alert-close"
    type="button"
    :aria-label="label"
  >
    <span
      class="alert-close-icon"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Close" });
</script>
