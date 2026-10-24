<template>
  <component
    :is="tag"
    class="btn"
    v-bind="bindings"
  >
    <span
      class="btn-frame"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
  href?: string | null;
  to?: RouteLocationRaw;
  target?: string;
  rel?: string;
}>();

const tag = computed(() => {
  if (props.to !== undefined) return NuxtLinkLocale;
  if (props.href !== undefined) return "a";
  return "button";
});

const rel = computed(() => {
  if (props.rel !== undefined) return props.rel;
  return props.target === "_blank" ? "noopener noreferrer" : undefined;
});

const bindings = computed(() => {
  if (props.to !== undefined) return { to: props.to, target: props.target, rel: rel.value };
  if (props.href === null) return { role: "link" };
  if (props.href !== undefined) return { href: props.href, target: props.target, rel: rel.value };
  return {};
});
</script>
