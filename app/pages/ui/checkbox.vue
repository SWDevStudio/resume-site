<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Чекбоксы</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox name="subscribe">Subscribe to updates</FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox-field checkbox</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox name="consent">
            I acknowledge and consent to the storage of my data
          </FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox-field checkbox :checked</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Ошибка</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox name="errorUnchecked">Subscribe to updates</FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox-field checkbox checkbox-error</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox name="errorChecked">
            I acknowledge and consent to the storage of my data
          </FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">
              checkbox-field checkbox checkbox-error :checked
            </code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Отключён</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox
            name="disabled"
            disabled
          >
            Subscribe to updates
          </FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox-field checkbox :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormCheckbox
            name="disabledChecked"
            disabled
          >
            Subscribe to updates
          </FormCheckbox>
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox-field checkbox :disabled :checked</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Голый input</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <input
            type="checkbox"
            class="checkbox"
            aria-label="checkbox"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="checkbox"
            class="checkbox"
            aria-label="checkbox :checked"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox :checked</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="checkbox"
            class="checkbox checkbox-error"
            aria-label="checkbox checkbox-error"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox checkbox-error</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            type="checkbox"
            class="checkbox checkbox-disabled"
            aria-label="checkbox checkbox-disabled"
            checked
          />
          <figcaption>
            <code class="text-xs text-brand-ink">checkbox checkbox-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useForm } from "vee-validate";
import FormCheckbox from "~/components/form/FormCheckbox/FormCheckbox.vue";

definePageMeta({ title: "Чекбоксы" });

useForm({
  initialValues: {
    subscribe: false,
    consent: true,
    errorUnchecked: false,
    errorChecked: true,
    disabled: false,
    disabledChecked: true,
  },
  initialErrors: {
    errorUnchecked: "Необходимо подтвердить согласие",
    errorChecked: "Необходимо подтвердить согласие",
  },
});
</script>
