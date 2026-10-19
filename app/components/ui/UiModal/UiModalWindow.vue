<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      v-bind="$attrs"
      class="modal"
      :data-state="state"
      :data-lock-scroll="lockScroll"
      :aria-labelledby="labelledBy"
      :aria-label="ariaLabel"
      @cancel.prevent="close"
      @close="onNativeClose"
      @pointerdown="onPointerDown"
      @click="onClick"
    >
      <template v-if="rendered">
        <component
          :is="part.component"
          v-for="part in sparkParts"
          :key="part.key"
          :class="part.class"
        />
        <div class="modal-screen">
          <div
            ref="windowRef"
            class="modal-window"
          >
            <component
              :is="part.component"
              v-for="part in windowParts"
              :key="part.key"
              :class="part.class"
            />
            <div class="modal-box">
              <div class="modal-inner">
                <component
                  :is="part.component"
                  v-for="part in innerParts"
                  :key="part.key"
                  :class="part.class"
                />
                <div class="modal-bar">
                  <UiModalClose
                    :label="closeLabel"
                    @click="close"
                  />
                </div>
                <div class="modal-body">
                  <div
                    v-if="hasHead"
                    class="modal-head"
                  >
                    <span
                      v-if="label"
                      class="modal-label"
                    >
                      {{ label }}
                    </span>
                    <h2
                      v-if="title"
                      :id="titleId"
                      class="modal-title"
                    >
                      {{ title }}
                      <span
                        v-if="accent"
                        class="modal-accent"
                      >
                        {{ accent }}
                      </span>
                    </h2>
                    <p
                      v-if="description"
                      class="modal-description"
                    >
                      {{ description }}
                    </p>
                  </div>
                  <slot />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, watch } from "vue";
import { MODAL_MODULE_KEY } from "./modalContext";
import { activeModalTheme, loadModalLayers } from "./modalLoader";
import { MODAL_LAYERS, type ModalLayerSlot } from "./modalLayers";
import UiModalClose from "./UiModalClose.vue";
import { useModalLayers } from "./useModalLayers";

type ModalState = "closed" | "opening" | "open" | "closing";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  label?: string;
  title?: string;
  accent?: string;
  description?: string;
  closeLabel: string;
  module?: string;
  opener?: HTMLElement | null;
}>();

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const model = defineModel<boolean>("open", { default: false });

const dialogRef = ref<HTMLDialogElement>();
const windowRef = ref<HTMLElement>();
const state = ref<ModalState>("closed");
const rendered = ref(false);
const titleId = useId();

const moduleName = computed(() => props.module ?? "module");
provide(MODAL_MODULE_KEY, moduleName);

const { layers, reset: resetLayers } = useModalLayers(MODAL_LAYERS);

function layerParts(slot: ModalLayerSlot) {
  return layers.value.flatMap((layer) =>
    layer.entry[slot].map((component, index) => ({
      key: `${layer.theme}-${slot}-${index}`,
      component,
      class: layer.late ? "modal-layer-late" : undefined,
    })),
  );
}

const sparkParts = computed(() => layerParts("spark"));
const windowParts = computed(() => layerParts("window"));
const innerParts = computed(() => layerParts("inner"));

const lockScroll = computed(() => (state.value === "closed" ? undefined : "true"));
const hasHead = computed(() => Boolean(props.label || props.title || props.description));
const labelledBy = computed(() => (props.title ? titleId : undefined));
const ariaLabel = computed(() => (props.title ? undefined : props.label));

let returnTarget: HTMLElement | null = null;
let pressedOutside = false;
let queue: Promise<void> = Promise.resolve();

function close() {
  model.value = false;
}

function runningAnimations(dialog: HTMLDialogElement) {
  return document.getAnimations().filter((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    return (
      animation instanceof CSSAnimation &&
      animation.animationName.startsWith("modal-") &&
      animation.effect?.getComputedTiming().endTime !== Infinity &&
      target &&
      dialog.contains(target)
    );
  });
}

async function settle(dialog: HTMLDialogElement) {
  await Promise.allSettled(runningAnimations(dialog).map((animation) => animation.finished));
}

async function show() {
  if (!dialogRef.value) await nextTick();
  const dialog = dialogRef.value;
  if (!dialog || state.value !== "closed") return;
  returnTarget =
    props.opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  resetLayers();
  await loadModalLayers(activeModalTheme());
  rendered.value = true;
  state.value = "opening";
  await nextTick();
  dialog.showModal();
  emit("open");
  await settle(dialog);
  if (state.value === "opening") state.value = "open";
}

function finalize() {
  if (state.value === "closed") return;
  state.value = "closed";
  rendered.value = false;
  model.value = false;
  if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
  returnTarget = null;
  emit("close");
}

async function hide() {
  const dialog = dialogRef.value;
  if (!dialog || state.value === "closed") return;
  state.value = "closing";
  await nextTick();
  await settle(dialog);
  dialog.close();
  finalize();
}

async function sync() {
  if (model.value) await show();
  else await hide();
}

function enqueue() {
  queue = queue.then(sync, sync);
}

function onNativeClose() {
  if (dialogRef.value?.open) return;
  finalize();
}

function onPointerDown(event: PointerEvent) {
  pressedOutside = !windowRef.value?.contains(event.target as Node);
}

function onClick(event: MouseEvent) {
  const outside = pressedOutside && !windowRef.value?.contains(event.target as Node);
  pressedOutside = false;
  if (outside) close();
}

watch(model, enqueue);

onBeforeUnmount(() => {
  if (state.value === "closed") return;
  state.value = "closed";
  emit("close");
});

onMounted(async () => {
  await nextTick();
  if (model.value) enqueue();
});
</script>
