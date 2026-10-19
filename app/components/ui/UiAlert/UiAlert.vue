<template>
  <div
    class="alert"
    :class="statusClass"
    :role="role"
    v-bind="$attrs"
  >
    <span
      class="alert-icon"
      aria-hidden="true"
    />
    <div class="alert-content">
      <span
        v-if="slots.title"
        class="alert-title"
      >
        <slot name="title" />
      </span>
      <span
        v-if="slots.default"
        class="alert-text"
      >
        <slot />
      </span>
    </div>
    <UiAlertClose
      v-if="closable"
      :label="closeLabel"
      @click="emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { AlertStatus } from "./alertStatus";
import UiAlertClose from "./UiAlertClose.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  status?: AlertStatus;
  closable?: boolean;
  closeLabel?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const slots = useSlots();

const STATUS_CLASS: Record<AlertStatus, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

const statusClass = computed(() => (props.status ? STATUS_CLASS[props.status] : undefined));
const role = computed(() =>
  props.status === "error" || props.status === "warning" ? "alert" : "status",
);
</script>
