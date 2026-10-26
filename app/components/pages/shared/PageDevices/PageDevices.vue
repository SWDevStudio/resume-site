<template>
  <div
    class="page-devices"
    :class="modeClass"
    aria-hidden="true"
  >
    <div
      v-if="screen"
      class="page-devices-laptop"
    >
      <div class="page-devices-lid">
        <span class="page-devices-camera" />
        <div class="page-devices-screen">
          <img
            class="page-devices-shot"
            :srcset="screen.srcset"
            :sizes="DEVICE_SCREEN_SIZES"
            :src="screen.src"
            alt=""
            :loading="loading"
            decoding="async"
          />
        </div>
      </div>
      <div class="page-devices-base">
        <span class="page-devices-notch" />
      </div>
    </div>
    <div
      v-if="phone"
      class="page-devices-phone"
    >
      <div class="page-devices-phone-screen">
        <img
          class="page-devices-shot"
          :class="phone.class"
          :srcset="phone.srcset"
          :sizes="phone.sizes"
          :src="phone.src"
          alt=""
          :loading="loading"
          decoding="async"
        />
        <span class="page-devices-island" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ImageAsset } from "~/assets/api/types/media";
import { imageSrcset } from "~/utils";
import {
  DEVICE_PHONE_SIZES,
  DEVICE_PHONE_SOLO_SIZES,
  DEVICE_SCREEN_SIZES,
} from "~/components/pages/shared/deviceSizes";

const props = withDefaults(
  defineProps<{
    image: ImageAsset | null;
    imageMobile?: ImageAsset | null;
    loading?: "lazy" | "eager";
  }>(),
  { imageMobile: null, loading: "lazy" },
);

const screen = computed(() =>
  props.image ? { src: props.image.src, srcset: imageSrcset(props.image) } : null,
);

const modeClass = computed(() => ({ "page-devices-phone-only": !screen.value }));

const phone = computed(() => {
  if (props.imageMobile) {
    return {
      class: "page-devices-shot-mobile",
      src: props.imageMobile.src,
      srcset: imageSrcset(props.imageMobile),
      sizes: screen.value ? DEVICE_PHONE_SIZES : DEVICE_PHONE_SOLO_SIZES,
    };
  }
  if (screen.value) {
    return {
      class: "page-devices-shot-phone",
      src: screen.value.src,
      srcset: screen.value.srcset,
      sizes: DEVICE_SCREEN_SIZES,
    };
  }
  return null;
});
</script>

<style src="./PageDevices.css" />
