<template>
  <div
    class="checkbox-field"
    v-bind="bindings.root"
  >
    <label>
      <input
        v-bind="bindings.control"
        type="checkbox"
        class="checkbox"
        :class="{ 'checkbox-error': errorMessage }"
        :name="name"
        :checked="checked"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="errorMessage ? errorId : undefined"
        @change="handleChange"
      />
      <slot />
    </label>
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

const props = defineProps<{ name: string }>();

const attrs = useAttrs();
const errorId = `${useId()}-error`;

const { checked, errorMessage, handleChange } = useField(() => props.name, undefined, {
  type: "checkbox",
  checkedValue: true,
  uncheckedValue: false,
});

const bindings = computed(() => {
  const { class: rootClass, style: rootStyle, ...control } = attrs;
  return { root: { class: rootClass, style: rootStyle }, control };
});
</script>
