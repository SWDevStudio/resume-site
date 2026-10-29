<template>
  <form
    class="home-contact-form"
    novalidate
    @submit="onSubmit"
  >
    <div class="home-contact-pane">
      <FormInput
        name="name"
        type="text"
        :label="t('home.contact.form.name')"
        :placeholder="t('home.contact.form.namePlaceholder')"
        autocomplete="name"
        aria-required="true"
      />
      <FormInput
        name="contact"
        type="text"
        :label="t('home.contact.form.email')"
        :placeholder="t('home.contact.form.emailPlaceholder')"
        aria-required="true"
      />
      <FormTextarea
        name="message"
        :label="t('home.contact.form.message')"
        :placeholder="t('home.contact.form.messagePlaceholder')"
      />
      <FormCheckbox
        class="home-contact-consent"
        name="consent"
        aria-required="true"
      >
        {{ t("home.contact.form.consent") }}
      </FormCheckbox>

      <div class="home-contact-actions">
        <UiButton
          class="home-contact-submit"
          type="submit"
          :disabled="sending"
          :aria-busy="sending"
        >
          {{ t("home.contact.form.submit") }}
          <span
            class="home-contact-submit-icons"
            aria-hidden="true"
          >
            <UiIcon
              name="arrow-send"
              class="home-contact-submit-arrow"
            />
            <UiIcon
              name="spinner"
              class="home-contact-submit-spinner"
            />
          </span>
        </UiButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import { computed } from "vue";
import { useToggle } from "@vueuse/core";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import FormCheckbox from "~/components/form/FormCheckbox/FormCheckbox.vue";
import FormInput from "~/components/form/FormInput/FormInput.vue";
import FormTextarea from "~/components/form/FormTextarea/FormTextarea.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useAlert } from "~/composables/useAlert";
import { $api } from "~/assets/api";
import { $metrika } from "~/assets/metrika";

const { t } = useI18n();
const alert = useAlert();

const schema = computed(() =>
  toTypedSchema(
    z.object({
      name: z.string().trim().min(1, t("home.contact.form.errors.name")),
      contact: z
        .string()
        .trim()
        .min(1, t("home.contact.form.errors.email"))
        .min(3, t("home.contact.form.errors.contactShort"))
        .max(200, t("home.contact.form.errors.contactLong")),
      message: z.string().trim().min(1, t("home.contact.form.errors.message")),
      consent: z.literal(true, {
        errorMap: () => ({ message: t("home.contact.form.errors.consent") }),
      }),
    }),
  ),
);

const [sending, toggleSending] = useToggle(false);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: "", contact: "", message: "", consent: false },
});

const onSubmit = handleSubmit(async (values) => {
  if (sending.value) return;
  toggleSending(true);
  try {
    await $api.contact.send(values);
    $metrika.contact.send();
    alert.success({
      title: t("home.contact.form.success.title"),
      description: t("home.contact.form.success.description"),
    });
    resetForm();
  } catch {
    alert.error({
      title: t("home.contact.form.failure.title"),
      description: t("home.contact.form.failure.description"),
    });
  } finally {
    toggleSending(false);
  }
});
</script>

<style src="./ContactForm.css" />
