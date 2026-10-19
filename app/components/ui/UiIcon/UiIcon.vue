<template>
  <span
    class="ui-icon"
    :style="vars"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { iconVars, type UiIconName } from "./icons";

const props = defineProps<{
  name: UiIconName;
}>();

const vars = computed(() => iconVars(props.name));
</script>

<style src="./UiIcon.css" />
