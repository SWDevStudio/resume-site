<template>
  <div
    class="page-terminal"
    aria-hidden="true"
  >
    <div class="page-terminal-monitor">
      <div class="page-terminal-body">
        <div class="page-terminal-screen">
          <img
            class="page-terminal-shot"
            :src="image"
            alt=""
            :loading="loading"
            decoding="async"
          />
        </div>
        <div class="page-terminal-chin">
          <span class="page-terminal-vents" />
          <span class="page-terminal-knob" />
          <span class="page-terminal-knob" />
          <span class="page-terminal-led" />
        </div>
      </div>
      <span class="page-terminal-neck" />
      <span class="page-terminal-foot" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string;
    loading?: "lazy" | "eager";
  }>(),
  { loading: "lazy" },
);
</script>

<style src="./PageTerminal.css" />
