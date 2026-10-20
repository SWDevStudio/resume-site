<template>
  <ClientOnly>
    <span
      style="display: contents"
      @pointerenter.capture="preload"
      @focusin="preload"
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
import { defineAsyncComponent, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
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

let idleHandle: number | undefined;
let stopLoadListener: (() => void) | undefined;

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

function scheduleIdlePreload() {
  const run = () => {
    idleHandle = undefined;
    preload();
  };
  if (typeof window.requestIdleCallback === "function")
    idleHandle = window.requestIdleCallback(run);
  else idleHandle = window.setTimeout(run, 2000);
}

function afterPageLoad() {
  if (document.readyState === "complete") {
    scheduleIdlePreload();
    return;
  }
  const onLoad = () => scheduleIdlePreload();
  window.addEventListener("load", onLoad, { once: true });
  stopLoadListener = () => window.removeEventListener("load", onLoad);
}

function intend() {
  opener.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  request();
}

watch(model, (value) => {
  if (value) intend();
});

onMounted(() => {
  afterPageLoad();
  if (model.value) intend();
});

onBeforeUnmount(() => {
  stopLoadListener?.();
  if (idleHandle === undefined) return;
  if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
  else window.clearTimeout(idleHandle);
});

defineExpose({ open, close });
</script>
