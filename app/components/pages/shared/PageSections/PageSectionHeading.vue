<template>
  <component
    :is="tag"
    :id="id"
    class="page-section-heading"
    :class="headingClass"
  >
    {{ name }}
    <span
      v-if="meta"
      class="page-section-meta"
    >
      {{ meta }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  tag: string;
  id?: string;
  name: string;
  meta?: string;
  metaInline?: boolean;
  visuallyHidden?: boolean;
}>();

const headingClass = computed(() => ({
  "page-section-heading-split": Boolean(props.meta) && !props.metaInline,
  "page-section-heading-inline": Boolean(props.meta) && props.metaInline,
  "page-section-heading-hidden": props.visuallyHidden,
}));
</script>
