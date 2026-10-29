<template>
  <div
    class="page-terminal"
    :aria-hidden="hidden"
  >
    <div class="page-terminal-monitor">
      <div class="page-terminal-body">
        <div class="page-terminal-screen">
          <img
            v-if="shot"
            class="page-terminal-shot"
            :srcset="shot.srcset"
            :sizes="DEVICE_SCREEN_SIZES"
            :src="shot.src"
            :alt="alt"
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
import { computed } from "vue";
import type { ImageAsset } from "~/assets/api/types/media";
import { DEVICE_SCREEN_SIZES } from "~/components/pages/shared/deviceSizes";
import { imageSrcset } from "~/utils";

const props = withDefaults(
  defineProps<{
    image: ImageAsset | null;
    alt?: string;
    loading?: "lazy" | "eager";
  }>(),
  { alt: "", loading: "lazy" },
);

const hidden = computed(() => (props.alt ? undefined : "true"));

const shot = computed(() =>
  props.image ? { src: props.image.src, srcset: imageSrcset(props.image) } : null,
);
</script>

<style src="./PageTerminal.css" />
