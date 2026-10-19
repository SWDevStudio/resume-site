<template>
  <div
    class="input-field"
    v-bind="bindings.root"
  >
    <label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </label>
    <div>
      <input
        v-bind="bindings.control"
        :id="id"
        class="input"
        :class="{ 'input-error': errorMessage }"
        :value="value"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="errorMessage ? errorId : undefined"
        @blur="handleBlur($event, true)"
        @input="handleChange($event, !!errorMessage)"
      />
    </div>
    <p
      v-if="errorMessage"
      :id="errorId"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { useField } from "vee-validate";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  name: string;
  label?: string;
}>();

const attrs = useAttrs();
const id = useId();
const errorId = `${id}-error`;

const { value, errorMessage, handleBlur, handleChange } = useField<string>(
  () => props.name,
  undefined,
  { validateOnValueUpdate: false },
);

const bindings = computed(() => {
  const { class: rootClass, style: rootStyle, ...control } = attrs;
  return { root: { class: rootClass, style: rootStyle }, control };
});
</script>
