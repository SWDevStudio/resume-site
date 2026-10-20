<template>
  <div class="font-body text-base-content">
    <TheHeader />
    <main class="min-h-svh">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheFooter from "~/components/global/TheFooter/TheFooter.vue";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
</script>
