<template>
  <div class="card-head">
    <h3
      v-if="title"
      class="card-title"
    >
      <span
        v-if="index"
        class="card-index"
      >
        {{ index }}
      </span>
      {{ title }}
    </h3>
    <span
      v-if="subtitle"
      class="card-subtitle"
    >
      {{ subtitle }}
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: string;
    title?: string;
    subtitle?: string;
  }>(),
  { index: undefined, title: undefined, subtitle: undefined },
);
</script>
