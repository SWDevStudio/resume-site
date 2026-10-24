<template>
  <div class="blog-cover-terminal">
    <div class="blog-cover-window">
      <div class="blog-cover-window-head">
        <span class="blog-cover-dot blog-cover-dot-red" />
        <span class="blog-cover-dot blog-cover-dot-yellow" />
        <span class="blog-cover-dot blog-cover-dot-green" />
        <span class="blog-cover-window-title">{{ cover.title }}</span>
      </div>
      <div class="blog-cover-window-body">
        <span class="blog-cover-command">
          <span class="blog-cover-prompt">$</span>
          {{ cover.command }}
        </span>
        <span class="blog-cover-output">{{ cover.output }}</span>
        <span class="blog-cover-cursor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogCoverTerminal } from "~/assets/api/types/blog";

defineProps<{
  cover: BlogCoverTerminal;
}>();
</script>

<style src="./BlogCoverTerminal.css" />
