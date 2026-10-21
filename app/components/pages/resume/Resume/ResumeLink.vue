<template>
  <a
    class="resume-link"
    :href="link"
    :target="target"
    :rel="rel"
  >
    {{ label }}
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  href?: string | null;
}>();

const link = computed(() => props.href ?? undefined);
const web = computed(() => /^https?:/.test(props.href ?? ""));
const target = computed(() => (web.value ? "_blank" : undefined));
const rel = computed(() => (props.href ? "noopener noreferrer" : undefined));
</script>

<style src="./ResumeLink.css" />
