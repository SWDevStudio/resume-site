<template>
  <div class="feature">
    <UiCardHead
      v-if="data.title"
      class="feature-head"
      :index="data.index"
      :title="data.title"
    />
    <div class="feature-box">
      <span
        class="card-frame"
        aria-hidden="true"
      />
      <span
        class="card-deco"
        aria-hidden="true"
      />
      <div class="card-body">
        <span
          v-if="data.label"
          class="feature-label"
        >
          {{ data.label }}
        </span>
        <p
          v-if="data.prompt"
          class="feature-prompt"
        >
          {{ data.prompt }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeatureData } from "~/components/ui/card/types";
import UiCardHead from "~/components/ui/card/UiCardHead/UiCardHead.vue";

defineProps<{
  data: FeatureData;
}>();
</script>
