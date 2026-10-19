<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Алерты</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="variant in variants"
          :key="variant.caption"
          class="flex w-95 flex-col gap-3"
        >
          <UiAlert :class="variant.modifier">
            <template #title>{{ variant.title }}</template>
            {{ variant.text }}
          </UiAlert>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ variant.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Без заголовка и текста</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-95 flex-col gap-3">
          <UiAlert class="alert-success">
            <template #title>Сообщение отправлено</template>
          </UiAlert>
          <figcaption>
            <code class="text-xs text-brand-ink">alert alert-success · slot title</code>
          </figcaption>
        </figure>
        <figure class="flex w-95 flex-col gap-3">
          <UiAlert class="alert-warning">Опишите задачу хотя бы в паре фраз.</UiAlert>
          <figcaption>
            <code class="text-xs text-brand-ink">alert alert-warning · slot default</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">С кнопкой закрытия</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex w-95 flex-col gap-3">
          <UiAlert
            status="success"
            closable
          >
            <template #title>Сообщение отправлено</template>
            Спасибо! Скоро свяжусь с вами.
          </UiAlert>
          <figcaption>
            <code class="text-xs text-brand-ink">alert status="success" closable</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">useAlert</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="trigger in triggers"
          :key="trigger.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiButton
            class="btn-sm"
            :class="trigger.modifier"
            type="button"
            @click="trigger.run()"
            >{{ trigger.label }}</UiButton
          >
          <figcaption>
            <code class="text-xs text-brand-ink">{{ trigger.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { definePageMeta } from "#imports";
import UiAlert from "~/components/ui/UiAlert/UiAlert.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useAlert } from "~/composables/useAlert";

definePageMeta({ title: "Алерты" });

const { t } = useI18n();
const alert = useAlert();

const triggers = [
  {
    modifier: "btn-secondary",
    label: "Info",
    caption: "alert.info({ title, description })",
    run: () =>
      alert.info({
        title: "Ответ в течение дня",
        description: "Обычно отвечаю в течение 24 часов.",
      }),
  },
  {
    modifier: "btn-secondary",
    label: "Info · t()",
    caption: "alert.info({ title: t(key), description: t(key), closeLabel: t(key) })",
    run: () =>
      alert.info({
        title: t("theme.toggle"),
        description: t("nav.catalog"),
        closeLabel: t("header.menuClose"),
      }),
  },
  {
    modifier: "btn-primary",
    label: "Success",
    caption: "alert.success({ title, description })",
    run: () =>
      alert.success({
        title: "Сообщение отправлено",
        description: "Спасибо! Скоро свяжусь с вами.",
      }),
  },
  {
    modifier: "btn-accent",
    label: "Warning",
    caption: "alert.warning({ title, description })",
    run: () =>
      alert.warning({
        title: "Слишком короткое сообщение",
        description: "Опишите задачу хотя бы в паре фраз.",
      }),
  },
  {
    modifier: "btn-primary",
    label: "Error",
    caption: "alert.error({ title, description })",
    run: () =>
      alert.error({
        title: "Не удалось отправить",
        description: "Проверьте email и попробуйте ещё раз.",
      }),
  },
  {
    modifier: "",
    label: "Шесть сразу",
    caption: "6 × alert.info() — видно 4, остальные в очереди",
    run: () => {
      for (let index = 1; index <= 6; index += 1) {
        alert.info({
          title: `Сообщение ${index}`,
          description: "Лимит одновременных сообщений — 4.",
        });
      }
    },
  },
  {
    modifier: "",
    label: "Очистить",
    caption: "alert.clear()",
    run: () => alert.clear(),
  },
];

const variants = [
  {
    modifier: "",
    caption: "alert",
    title: "Ответ в течение дня",
    text: "Обычно отвечаю в течение 24 часов.",
  },
  {
    modifier: "alert-info",
    caption: "alert alert-info",
    title: "Ответ в течение дня",
    text: "Обычно отвечаю в течение 24 часов.",
  },
  {
    modifier: "alert-success",
    caption: "alert alert-success",
    title: "Сообщение отправлено",
    text: "Спасибо! Скоро свяжусь с вами.",
  },
  {
    modifier: "alert-warning",
    caption: "alert alert-warning",
    title: "Слишком короткое сообщение",
    text: "Опишите задачу хотя бы в паре фраз.",
  },
  {
    modifier: "alert-error",
    caption: "alert alert-error",
    title: "Не удалось отправить",
    text: "Проверьте email и попробуйте ещё раз.",
  },
];
</script>
