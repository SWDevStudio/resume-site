<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Формы</h1>

    <form
      class="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
      novalidate
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-5">
        <FormInput
          name="name"
          label="Name*"
          placeholder="John Doe"
          autocomplete="name"
        />
        <FormInput
          name="email"
          label="Email Address*"
          placeholder="name@mail"
          type="email"
          autocomplete="email"
        />
        <FormTextarea
          name="message"
          label="Message"
          placeholder="There is space for your project here"
        />
      </div>

      <div class="flex flex-col gap-6.5">
        <div class="flex flex-col gap-3.5">
          <FormCheckbox name="consent">
            I acknowledge and consent to the storage of my data
          </FormCheckbox>
          <FormCheckbox name="subscribe">Subscribe to updates</FormCheckbox>
        </div>
        <FormRadio
          name="projectType"
          label="Project type"
          :options="projectTypes"
        />
        <FormToggle name="reduceMotion">Reduce motion</FormToggle>
        <UiButton
          class="self-start btn-primary"
          type="submit"
        >
          Send message
        </UiButton>
      </div>
    </form>

    <div
      v-if="submitted"
      class="flex flex-col gap-3"
    >
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Отправлено</h2>
      <pre class="text-xs text-brand-ink">{{ submitted }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { definePageMeta } from "#imports";
import FormCheckbox from "~/components/form/FormCheckbox/FormCheckbox.vue";
import FormInput from "~/components/form/FormInput/FormInput.vue";
import FormRadio from "~/components/form/FormRadio/FormRadio.vue";
import FormTextarea from "~/components/form/FormTextarea/FormTextarea.vue";
import FormToggle from "~/components/form/FormToggle/FormToggle.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";

definePageMeta({ title: "Формы" });

const projectTypes = [
  { value: "landing", label: "Landing page" },
  { value: "store", label: "Online store" },
];

const schema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, "Введите имя"),
    email: z.string().trim().min(1, "Введите email").email("Введите корректный email"),
    message: z.string().optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Нужно согласие на хранение данных" }),
    }),
    subscribe: z.boolean(),
    projectType: z.enum(["landing", "store"], {
      errorMap: () => ({ message: "Выберите тип проекта" }),
    }),
    reduceMotion: z.boolean(),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    email: "",
    message: "",
    subscribe: false,
    reduceMotion: false,
  },
});

const submitted = ref("");

const onSubmit = handleSubmit((values) => {
  submitted.value = JSON.stringify(values, null, 2);
});
</script>
