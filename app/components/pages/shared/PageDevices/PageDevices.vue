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
            :srcset="screenSrcset"
            :sizes="DEVICE_SCREEN_SIZES"
            :src="image.src"
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
    <div class="page-devices-phone">
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
import { DEVICE_PHONE_SIZES, DEVICE_SCREEN_SIZES } from "~/components/pages/shared/deviceSizes";

const props = withDefaults(
  defineProps<{
    image: ImageAsset;
    imageMobile?: ImageAsset | null;
    loading?: "lazy" | "eager";
  }>(),
  { imageMobile: null, loading: "lazy" },
);

const screenSrcset = computed(() => imageSrcset(props.image));

const phone = computed(() =>
  props.imageMobile
    ? {
        class: "page-devices-shot-mobile",
        src: props.imageMobile.src,
        srcset: imageSrcset(props.imageMobile),
        sizes: DEVICE_PHONE_SIZES,
      }
    : {
        class: "page-devices-shot-phone",
        src: props.image.src,
        srcset: screenSrcset.value,
        sizes: DEVICE_SCREEN_SIZES,
      },
);
</script>

<style src="./PageDevices.css" />
