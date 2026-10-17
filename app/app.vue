<script setup lang="ts">
import { NuxtPage, NuxtRouteAnnouncer } from "#components";
import { useTheme } from "~/composables/useTheme";

useTheme();
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
