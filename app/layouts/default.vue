<template>
  <div class="font-body text-base-content">
    <TheSkipLink :target="MAIN_ID" />
    <TheHeader />
    <main
      :id="MAIN_ID"
      class="min-h-svh outline-none"
      tabindex="-1"
    >
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheFooter from "~/components/global/TheFooter/TheFooter.vue";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import TheSkipLink from "~/components/global/TheSkipLink/TheSkipLink.vue";

const MAIN_ID = "main";
</script>
