<template>
  <fieldset class="radio-field">
    <legend v-if="label">{{ label }}</legend>
    <div>
      <label
        v-for="option in options"
        :key="option.value"
      >
        <input
          type="radio"
          class="radio"
          :class="{ 'radio-error': errorMessage }"
          :name="groupName"
          :value="option.value"
          :checked="value === option.value"
          :disabled="option.disabled"
          :aria-invalid="errorMessage ? 'true' : undefined"
          :aria-describedby="errorMessage ? errorId : undefined"
          @change="handleChange(option.value)"
        />
        {{ option.label }}
      </label>
    </div>
    <p
      v-if="errorMessage"
      :id="errorId"
    >
      {{ errorMessage }}
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { useField } from "vee-validate";

const props = defineProps<{
  name: string;
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  label?: string;
}>();

const groupName = useId();
const errorId = `${groupName}-error`;

const { value, errorMessage, handleChange } = useField<string>(() => props.name);
</script>
