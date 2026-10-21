<template>
  <div class="blog-cover-video-layer">
    <span class="blog-cover-video-title">{{ cover.title }}</span>
    <span class="blog-cover-play">
      <span class="blog-cover-play-body">
        <span class="blog-cover-play-icon" />
      </span>
    </span>
    <span class="blog-cover-duration">{{ cover.duration }}</span>
  </div>
</template>

<script setup lang="ts">
import type { BlogCoverVideo } from "~/types/blog";

defineProps<{
  cover: BlogCoverVideo;
}>();
</script>

<style src="./BlogCoverVideo.css" />
