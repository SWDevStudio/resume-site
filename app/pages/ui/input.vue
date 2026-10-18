<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Поля ввода</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormInput
            name="name"
            label="Name*"
            placeholder="John Doe"
            autocomplete="off"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input-field input</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormInput
            name="phone"
            placeholder="+7 900 000-00-00"
            type="tel"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input-field input</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <input
            class="input"
            type="text"
            placeholder="John Doe"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormInput
            name="email"
            label="Email Address*"
            placeholder="name@mail"
            type="email"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input-field input input-error</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <input
            class="input input-error"
            type="text"
            placeholder="name@mail"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input input-error</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormInput
            name="company"
            label="Company"
            placeholder="Sawa Studio"
            disabled
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input-field input :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <input
            class="input input-disabled"
            type="text"
            placeholder="Sawa Studio"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">input input-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { definePageMeta } from "#imports";
import FormInput from "~/components/form/FormInput/FormInput.vue";

definePageMeta({ title: "Поля ввода" });

useForm({ initialErrors: { email: "Введите корректный email" } });
</script>
