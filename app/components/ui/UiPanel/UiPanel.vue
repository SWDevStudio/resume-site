<template>
  <div class="panel">
    <span
      class="card-frame"
      aria-hidden="true"
    />
    <span
      class="card-deco"
      aria-hidden="true"
    />
    <div class="card-body">
      <UiCardHead
        v-if="data.title"
        :index="data.index"
        :title="data.title"
      />
      <div
        v-if="slots.default"
        class="panel-content"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from "vue";
import type { PanelData } from "~/components/ui/card/types";
import UiCardHead from "~/components/ui/card/UiCardHead/UiCardHead.vue";

defineProps<{
  data: PanelData;
}>();

const slots = useSlots();
</script>
