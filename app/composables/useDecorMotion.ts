import { computed, onMounted, ref } from "vue";
import { useDocumentVisibility, useElementVisibility, type MaybeElementRef } from "@vueuse/core";

const IDLE_TIMEOUT_MS = 1500;
const IDLE_FALLBACK_MS = 300;

const ready = ref(false);
let scheduled = false;

function markReady() {
  ready.value = true;
}

function waitIdle() {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(markReady, { timeout: IDLE_TIMEOUT_MS });
    return;
  }
  window.setTimeout(markReady, IDLE_FALLBACK_MS);
}

function scheduleReady() {
  if (scheduled) return;
  scheduled = true;
  if (document.readyState === "complete") {
    waitIdle();
    return;
  }
  window.addEventListener("load", waitIdle, { once: true });
}

export function useDecorMotion(target: MaybeElementRef) {
  const visible = useElementVisibility(target);
  const documentVisibility = useDocumentVisibility();

  const paused = computed(
    () => !ready.value || !visible.value || documentVisibility.value === "hidden",
  );

  onMounted(scheduleReady);

  return { paused };
}
