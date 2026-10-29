<template>
  <div class="project-case-cover">
    <div
      class="project-case-stage"
      :class="modeClass"
    >
      <span
        class="project-case-grid"
        aria-hidden="true"
      />
      <PageTerminal
        v-if="terminal"
        :image="data.image"
        :alt="data.imageAlt"
        loading="eager"
      />
      <template v-else>
        <div
          v-if="screen"
          class="project-case-laptop"
        >
          <div class="project-case-lid">
            <span class="project-case-camera" />
            <div class="project-case-screen">
              <img
                class="project-case-shot"
                :srcset="screen.srcset"
                :sizes="DEVICE_SCREEN_SIZES"
                :src="screen.src"
                :alt="data.imageAlt"
              />
            </div>
          </div>
          <div class="project-case-base">
            <span class="project-case-notch" />
          </div>
        </div>
        <div
          v-if="phone"
          class="project-case-phone"
        >
          <div class="project-case-phone-screen">
            <img
              class="project-case-shot"
              :class="phone.class"
              :srcset="phone.srcset"
              :sizes="phone.sizes"
              :src="phone.src"
              :alt="phone.alt"
            />
            <span class="project-case-island" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PageTerminal from "~/components/pages/shared/PageTerminal/PageTerminal.vue";
import {
  DEVICE_PHONE_SIZES,
  DEVICE_PHONE_SOLO_SIZES,
  DEVICE_SCREEN_SIZES,
} from "~/components/pages/shared/deviceSizes";
import type { ProjectCaseCoverData } from "~/assets/api/types/projectCase";
import { imageSrcset } from "~/utils";

const props = defineProps<{
  data: ProjectCaseCoverData;
}>();

const terminal = computed(() => props.data.frame === "terminal");

const screen = computed(() =>
  props.data.image ? { src: props.data.image.src, srcset: imageSrcset(props.data.image) } : null,
);

const modeClass = computed(() => ({ "project-case-stage-phone-only": !screen.value }));

const phone = computed(() => {
  if (props.data.imageMobile) {
    return {
      class: "project-case-shot-mobile",
      src: props.data.imageMobile.src,
      srcset: imageSrcset(props.data.imageMobile),
      sizes: screen.value ? DEVICE_PHONE_SIZES : DEVICE_PHONE_SOLO_SIZES,
      alt: screen.value ? "" : props.data.imageAlt,
    };
  }
  if (screen.value) {
    return {
      class: "project-case-shot-phone",
      src: screen.value.src,
      srcset: screen.value.srcset,
      sizes: DEVICE_SCREEN_SIZES,
      alt: "",
    };
  }
  return null;
});
</script>

<style src="./ProjectCaseCover.css" />
