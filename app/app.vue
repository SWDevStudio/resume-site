<script setup lang="ts">
import { NuxtLayout, NuxtPage, NuxtRouteAnnouncer } from "#components";
import { useSiteHead } from "~/composables/useSiteHead";

useSiteHead();
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
