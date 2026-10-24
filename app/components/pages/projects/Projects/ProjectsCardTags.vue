<template>
  <ul class="projects-card-tags">
    <li
      v-for="tag in tags"
      :key="tag"
      class="projects-card-tag"
    >
      {{ tag }}
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[];
}>();
</script>

<style src="./ProjectsCardTags.css" />
