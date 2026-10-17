<template>
  <div class="font-body text-base-content">
    <header
      class="sticky top-0 z-10 flex items-center justify-between gap-6 bg-base-100/85 px-8 py-4 backdrop-blur-md"
    >
      <span class="font-head text-2xl">Sawa UI</span>
      <div class="flex items-center gap-8">
        <NuxtLink v-if="isDev" class="btn btn-ghost" to="/ui">UI-каталог</NuxtLink>
        <UiButton class="btn-sm" type="button" @click="toggle">Сменить тему</UiButton>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useTheme } from "~/composables/useTheme";

const { toggle } = useTheme();
const isDev = import.meta.dev;
</script>
