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
              :src="image"
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
            class="project-case-shot project-case-shot-phone"
            :src="image"
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
import { resolveProjectImage } from "~/components/pages/shared/projectImage";
import type { ProjectCaseCoverData } from "~/types/projectCase";

const props = defineProps<{
  data: ProjectCaseCoverData;
}>();

const image = computed(() => resolveProjectImage(props.data.image));
</script>

<style src="./ProjectCaseCover.css" />
