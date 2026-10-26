<template>
  <ClientOnly>
    <span
      style="display: contents"
      @pointerenter.capture="preload"
      @focusin="preload"
      @touchstart.passive="preload"
    >
      <slot
        name="trigger"
        :open="open"
        :close="close"
        :is-open="model"
      />
    </span>
    <component
      :is="windowComponent"
      v-if="windowComponent"
      v-bind="$attrs"
      v-model:open="model"
      :label="label"
      :title="title"
      :accent="accent"
      :description="description"
      :close-label="closeLabel"
      :module="module"
      :opener="opener"
      @open="emit('open')"
      @close="emit('close')"
    >
      <slot />
    </component>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, shallowRef, watch } from "vue";
import type { Component } from "vue";
import { ClientOnly } from "#components";
import { loadModalWindow } from "./modalLoader";

defineOptions({ inheritAttrs: false });

defineProps<{
  label?: string;
  title?: string;
  accent?: string;
  description?: string;
  closeLabel: string;
  module?: string;
}>();

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const model = defineModel<boolean>({ default: false });

const windowComponent = shallowRef<Component>();
const opener = shallowRef<HTMLElement | null>(null);

function request() {
  if (windowComponent.value) return;
  windowComponent.value = defineAsyncComponent({
    loader: loadModalWindow,
    onError(error) {
      console.error("UiModal: the window could not be loaded", error);
      windowComponent.value = undefined;
      model.value = false;
    },
  });
}

function preload() {
  loadModalWindow().catch(() => undefined);
}

function open() {
  model.value = true;
}

function close() {
  model.value = false;
}

function intend() {
  opener.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  request();
}

watch(model, (value) => {
  if (value) intend();
});

onMounted(() => {
  if (model.value) intend();
});

defineExpose({ open, close });
</script>
