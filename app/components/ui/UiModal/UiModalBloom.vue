<template>
  <div
    class="modal-bloom modal-layer-sakura modal-layer"
    aria-hidden="true"
  >
    <div class="modal-bloom-anchor">
      <div class="modal-bloom-halo">
        <span class="modal-bloom-glow" />
        <span class="modal-bloom-ring modal-bloom-ring-near" />
        <span class="modal-bloom-ring modal-bloom-ring-mid" />
        <span class="modal-bloom-ring modal-bloom-ring-far" />
        <span
          class="modal-bloom-status"
          lang="en"
          data-atom-skip
        >
          BLOOMING…
        </span>
      </div>
    </div>
    <div class="modal-bloom-anchor">
      <div class="modal-bloom-grow">
        <img
          class="modal-bloom-art"
          src="./media/branches-cyber-sakura.svg"
          alt=""
        />
      </div>
    </div>
    <div class="modal-bloom-anchor">
      <div class="modal-bloom-base">
        <img
          class="modal-bloom-art"
          src="./media/handle-cyber-sakura.svg"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style src="./UiModalBloom.css" />
