<template>
  <div
    class="modal-bloom-front modal-layer-sakura modal-layer"
    aria-hidden="true"
  >
    <div class="modal-bloom-anchor">
      <div class="modal-bloom-base">
        <img
          class="modal-bloom-art"
          src="./media/coupling-cyber-sakura.svg"
          alt=""
        />
      </div>
    </div>
    <div class="modal-bloom-shards">
      <img
        v-for="shard in shards"
        :key="shard"
        class="modal-bloom-shard"
        :class="shard"
        src="./media/shard-cyber-sakura.svg"
        alt=""
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const shards = [
  "modal-bloom-shard-1",
  "modal-bloom-shard-2",
  "modal-bloom-shard-3",
  "modal-bloom-shard-4",
  "modal-bloom-shard-5",
];
</script>

<style src="./UiModalBloomCoupling.css" />
