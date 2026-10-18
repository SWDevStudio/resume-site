<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Радиокнопки</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="empty"
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field radio</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="selected"
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field radio :checked</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="labelled"
            label="Тип проекта"
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field &gt; legend</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Ошибка</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="errorEmpty"
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field radio radio-error</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="errorSelected"
            label="Тип проекта"
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field radio radio-error :checked</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Отключён</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="disabledGroup"
            disabled
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="disabledGroupSelected"
            disabled
            :options="options"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field :disabled radio :checked</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormRadio
            name="disabledOption"
            :options="optionsWithDisabled"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio-field radio :disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Голый input</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <input
            type="radio"
            class="radio"
            aria-label="radio"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="radio"
            class="radio"
            aria-label="radio :checked"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio :checked</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="radio"
            class="radio radio-error"
            aria-label="radio radio-error"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio radio-error</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="radio"
            class="radio radio-disabled"
            aria-label="radio radio-disabled"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">radio radio-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useForm } from "vee-validate";
import FormRadio from "~/components/form/FormRadio/FormRadio.vue";

definePageMeta({ title: "Радиокнопки" });

const options = [
  { value: "landing", label: "Landing page" },
  { value: "store", label: "Online store" },
];

const optionsWithDisabled = [
  { value: "landing", label: "Landing page" },
  { value: "store", label: "Online store", disabled: true },
];

useForm({
  initialValues: {
    selected: "landing",
    labelled: "store",
    errorSelected: "landing",
    disabledGroupSelected: "landing",
    disabledOption: "landing",
  },
  initialErrors: {
    errorEmpty: "Выберите тип проекта",
    errorSelected: "Выберите тип проекта",
  },
});
</script>
