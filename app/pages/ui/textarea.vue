<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Многострочные поля</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormTextarea
            name="message"
            label="Message"
            placeholder="There is space for your project here"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea-field textarea</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormTextarea
            name="note"
            placeholder="Add a note"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea-field textarea</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <textarea
            class="textarea"
            placeholder="There is space for your project here"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormTextarea
            name="feedback"
            label="Message"
            placeholder="There is space for your project here"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea-field textarea textarea-error</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <textarea
            class="textarea textarea-error"
            placeholder="There is space for your project here"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea textarea-error</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <FormTextarea
            name="comment"
            label="Comment"
            placeholder="Not available right now"
            disabled
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea-field textarea :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-sm flex-col gap-3">
          <textarea
            class="textarea textarea-disabled"
            placeholder="Not available right now"
          />
          <figcaption>
            <code class="text-xs text-brand-ink">textarea textarea-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { definePageMeta } from "#imports";
import FormTextarea from "~/components/form/FormTextarea/FormTextarea.vue";

definePageMeta({ title: "Многострочные поля" });

useForm({ initialErrors: { feedback: "Введите сообщение" } });
</script>
