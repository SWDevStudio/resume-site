<template>
  <button
    class="modal-close"
    type="button"
    :aria-label="label"
  >
    <span
      class="modal-close-icon"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style src="./UiModalClose.css" />
