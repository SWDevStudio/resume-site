<template>
  <pre
    class="blog-post-code"
    data-atom-skip
    translate="no"
  ><code
    class="blog-post-code-body"
    :data-language="data.language"
    tabindex="0"
  >{{ data.code }}</code></pre>
</template>

<script setup lang="ts">
import type { BlogPostCodeData } from "~/assets/api/types/blog";

defineProps<{
  data: BlogPostCodeData;
}>();
</script>

<style src="./BlogPostCode.css" />
