<template>
  <div
    class="modal-holo-glass modal-layer-torii modal-layer"
    aria-hidden="true"
  >
    <span class="modal-holo-scan" />
    <span class="modal-holo-hair" />
    <img
      v-for="corner in corners"
      :key="corner"
      class="modal-holo-corner"
      :class="corner"
      src="./media/corner-torii-synth.svg"
      alt=""
    />
    <span
      class="modal-holo-hud"
      lang="en"
      data-atom-skip
    >
      <span class="modal-holo-pip" />
      {{ hud }}
    </span>
    <img
      class="modal-holo-ticks"
      src="./media/ticks-torii-synth.svg"
      alt=""
    />
    <div class="modal-holo-foot">
      <span
        lang="en"
        data-atom-skip
      >
        HOLO-LINK · ENCRYPTED
      </span>
      <span
        class="modal-holo-foot-coords"
        lang="en"
        data-atom-skip
      >
        X 0.50 · Y 0.50 · v1.0
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { MODAL_MODULE_KEY } from "./modalContext";

const corners = [
  "modal-holo-corner-tl",
  "modal-holo-corner-tr",
  "modal-holo-corner-br",
  "modal-holo-corner-bl",
];

const moduleName = inject(MODAL_MODULE_KEY, ref("module"));
const hud = computed(() => `SYS://${moduleName.value.toUpperCase()}.MODULE`);
</script>

<style src="./UiModalHoloGlass.css" />
