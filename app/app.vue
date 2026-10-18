<script setup lang="ts">
import { NuxtPage, NuxtRouteAnnouncer } from "#components";
import { useHead } from "#imports";
import { useLocale } from "~/composables/useLocale";
import { useTheme } from "~/composables/useTheme";

useTheme();
const { locale } = useLocale();
useHead({ htmlAttrs: { lang: locale } });
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
