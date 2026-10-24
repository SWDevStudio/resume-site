<template>
  <div
    class="page-devices"
    aria-hidden="true"
  >
    <div class="page-devices-laptop">
      <div class="page-devices-lid">
        <span class="page-devices-camera" />
        <div class="page-devices-screen">
          <img
            class="page-devices-shot"
            :src="image"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div class="page-devices-base">
        <span class="page-devices-notch" />
      </div>
    </div>
    <div class="page-devices-phone">
      <div class="page-devices-phone-screen">
        <img
          class="page-devices-shot"
          :class="phoneClass"
          :src="phoneImage"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span class="page-devices-island" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  image: string;
  imageMobile?: string | null;
}>();

const phoneImage = computed(() => props.imageMobile ?? props.image);
const phoneClass = computed(() =>
  props.imageMobile ? "page-devices-shot-mobile" : "page-devices-shot-phone",
);
</script>

<style src="./PageDevices.css" />
