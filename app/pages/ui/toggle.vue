<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Тумблеры</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormToggle name="reduceMotion">Reduce motion</FormToggle>
          <figcaption>
            <code class="text-xs text-brand-ink">toggle-field toggle</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormToggle name="themeSwitch">Torii Synth / Cyber Sakura</FormToggle>
          <figcaption>
            <code class="text-xs text-brand-ink">toggle-field toggle :checked</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Ошибка</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormToggle name="consent">I agree to the terms</FormToggle>
          <figcaption>
            <code class="text-xs text-brand-ink">toggle-field toggle toggle-error</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Отключён</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <FormToggle
            name="disabledOff"
            disabled
          >
            Reduce motion
          </FormToggle>
          <figcaption>
            <code class="text-xs text-brand-ink">toggle-field toggle :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <FormToggle
            name="disabledOn"
            disabled
          >
            Torii Synth / Cyber Sakura
          </FormToggle>
          <figcaption>
            <code class="text-xs text-brand-ink">toggle-field toggle :checked :disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Голый input</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <input
            class="toggle"
            type="checkbox"
            role="switch"
            aria-label="toggle"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">toggle</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            class="toggle toggle-error"
            type="checkbox"
            role="switch"
            aria-label="error"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">toggle toggle-error</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <input
            class="toggle toggle-disabled"
            type="checkbox"
            role="switch"
            checked
            aria-label="disabled"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">toggle toggle-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { definePageMeta } from "#imports";
import FormToggle from "~/components/form/FormToggle/FormToggle.vue";

definePageMeta({ title: "Тумблеры" });

useForm({
  initialValues: {
    reduceMotion: false,
    themeSwitch: true,
    consent: false,
    disabledOff: false,
    disabledOn: true,
  },
  initialErrors: { consent: "Consent is required" },
});
</script>
