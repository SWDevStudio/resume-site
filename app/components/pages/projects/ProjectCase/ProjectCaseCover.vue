<template>
  <div class="project-case-cover">
    <div
      class="project-case-stage"
      role="img"
      :aria-label="data.imageAlt"
    >
      <span
        class="project-case-grid"
        aria-hidden="true"
      />
      <div class="project-case-laptop">
        <div class="project-case-lid">
          <span class="project-case-camera" />
          <div class="project-case-screen">
            <img
              class="project-case-shot"
              :srcset="screenSrcset"
              :sizes="DEVICE_SCREEN_SIZES"
              :src="data.image.src"
              alt=""
            />
          </div>
        </div>
        <div class="project-case-base">
          <span class="project-case-notch" />
        </div>
      </div>
      <div class="project-case-phone">
        <div class="project-case-phone-screen">
          <img
            class="project-case-shot"
            :class="phone.class"
            :srcset="phone.srcset"
            :sizes="phone.sizes"
            :src="phone.src"
            alt=""
          />
          <span class="project-case-island" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DEVICE_PHONE_SIZES, DEVICE_SCREEN_SIZES } from "~/components/pages/shared/deviceSizes";
import type { ProjectCaseCoverData } from "~/assets/api/types/projectCase";
import { imageSrcset } from "~/utils";

const props = defineProps<{
  data: ProjectCaseCoverData;
}>();

const screenSrcset = computed(() => imageSrcset(props.data.image));

const phone = computed(() =>
  props.data.imageMobile
    ? {
        class: "project-case-shot-mobile",
        src: props.data.imageMobile.src,
        srcset: imageSrcset(props.data.imageMobile),
        sizes: DEVICE_PHONE_SIZES,
      }
    : {
        class: "project-case-shot-phone",
        src: props.data.image.src,
        srcset: screenSrcset.value,
        sizes: DEVICE_SCREEN_SIZES,
      },
);
</script>

<style src="./ProjectCaseCover.css" />
