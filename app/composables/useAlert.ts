import { computed, defineComponent, h, ref, render, TransitionGroup, type VNodeChild } from "vue";
import UiAlert from "~/components/ui/UiAlert/UiAlert.vue";
import type { AlertStatus } from "~/components/ui/UiAlert/alertStatus";

const ALERT_MAX_VISIBLE = 4;
const ALERT_DURATION_BASE = 1500;
const ALERT_DURATION_PER_CHAR = 60;
const ALERT_DURATION_MIN = 4000;
const ALERT_DURATION_MAX = 12000;
const ALERT_HOST_ATTRIBUTE = "data-alert-host";

export interface AlertOptions {
  title: string;
  description?: string;
  duration?: number;
  closeLabel?: string;
}

interface AlertItem {
  id: number;
  status: AlertStatus;
  title: string;
  description?: string;
  duration: number;
  closeLabel?: string;
}

interface AlertTimer {
  handle: ReturnType<typeof setTimeout>;
  startedAt: number;
  left: number;
}

const items = ref<AlertItem[]>([]);
const visible = computed(() => items.value.slice(0, ALERT_MAX_VISIBLE));
const timers = new Map<number, AlertTimer>();
const paused = new Map<number, number>();

let sequence = 0;
let mounted: HTMLElement | undefined;

function alertDuration(title: string, description = "") {
  const reading =
    ALERT_DURATION_BASE + (title.length + description.length) * ALERT_DURATION_PER_CHAR;
  return Math.min(ALERT_DURATION_MAX, Math.max(ALERT_DURATION_MIN, reading));
}

function renderItem(item: AlertItem): VNodeChild {
  const slots: Record<string, () => string> = { title: () => item.title };
  if (item.description) slots.default = () => item.description!;

  return h(
    UiAlert,
    {
      key: item.id,
      status: item.status,
      closable: true,
      closeLabel: item.closeLabel,
      onClose: () => remove(item.id),
      onMouseenter: () => pause(item.id),
      onMouseleave: () => resume(item.id),
      onFocusin: () => pause(item.id),
      onFocusout: () => resume(item.id),
    },
    slots,
  );
}

const AlertHost = defineComponent({
  name: "AlertHost",
  setup() {
    return () =>
      h(
        TransitionGroup,
        {
          tag: "div",
          name: "alert",
          appear: true,
          class: "toast toast-top toast-center md:toast-end",
          "aria-live": "polite",
          "aria-relevant": "additions text",
        },
        () => visible.value.map(renderItem),
      );
  },
});

function mountHost() {
  if (typeof window === "undefined") return false;

  let container = document.querySelector<HTMLElement>(`[${ALERT_HOST_ATTRIBUTE}]`);
  if (!container) {
    container = document.createElement("div");
    container.setAttribute(ALERT_HOST_ATTRIBUTE, "");
    document.body.appendChild(container);
  }

  if (mounted === container) return true;

  if (mounted) render(null, mounted);
  render(h(AlertHost), container);
  mounted = container;
  return true;
}

function stop(id: number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer.handle);
  timers.delete(id);
  paused.delete(id);
}

function start(id: number, left: number) {
  if (!Number.isFinite(left) || left <= 0) return;
  const handle = setTimeout(() => remove(id), left);
  timers.set(id, { handle, startedAt: Date.now(), left });
}

function sync() {
  if (!mountHost()) return;
  for (const item of visible.value) {
    if (!timers.has(item.id) && !paused.has(item.id)) start(item.id, item.duration);
  }
}

function pause(id: number) {
  const timer = timers.get(id);
  if (!timer) return;
  clearTimeout(timer.handle);
  timers.delete(id);
  paused.set(id, Math.max(0, timer.left - (Date.now() - timer.startedAt)));
}

function resume(id: number) {
  const left = paused.get(id);
  if (left === undefined) return;
  paused.delete(id);
  start(id, left);
}

function remove(id: number) {
  if (typeof window === "undefined") return;
  stop(id);
  items.value = items.value.filter((item) => item.id !== id);
  sync();
}

function clear() {
  if (typeof window === "undefined") return;
  for (const timer of timers.values()) clearTimeout(timer.handle);
  timers.clear();
  paused.clear();
  items.value = [];
}

function push(status: AlertStatus, options: AlertOptions) {
  if (typeof window === "undefined") return 0;
  sequence += 1;
  const id = sequence;
  items.value = [
    ...items.value,
    {
      id,
      status,
      title: options.title,
      description: options.description,
      closeLabel: options.closeLabel,
      duration: options.duration ?? alertDuration(options.title, options.description),
    },
  ];
  sync();
  return id;
}

const api = {
  info: (options: AlertOptions) => push("info", options),
  success: (options: AlertOptions) => push("success", options),
  warning: (options: AlertOptions) => push("warning", options),
  error: (options: AlertOptions) => push("error", options),
  remove,
  clear,
};

export function useAlert() {
  return api;
}
