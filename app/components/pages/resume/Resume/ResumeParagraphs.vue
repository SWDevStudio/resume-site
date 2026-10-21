<template>
  <p
    v-for="(paragraph, index) in paragraphs"
    :key="index"
    class="resume-text"
  >
    {{ paragraph }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  paragraphs: string[];
}>();
</script>
