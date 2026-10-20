<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Модальные окна</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="variant in variants"
          :key="variant.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiModal
            v-bind="variant.props"
            :close-label="t('header.menuClose')"
          >
            <template #trigger="{ open }">
              <UiButton
                class="btn-secondary btn-sm"
                type="button"
                @click="open"
              >
                {{ variant.label }}
              </UiButton>
            </template>
            <form
              v-if="variant.form"
              class="flex flex-col gap-4"
              novalidate
            >
              <FormInput
                name="name"
                label="Name*"
                placeholder="John Doe"
                autocomplete="off"
              />
              <FormInput
                name="email"
                label="Email Address*"
                placeholder="example@email.com"
                autocomplete="off"
              />
              <FormTextarea
                name="message"
                label="Message"
                placeholder="There is space for your project here"
              />
              <FormCheckbox name="consent">
                I acknowledge and consent to the storage of my data
              </FormCheckbox>
              <UiButton
                class="w-full"
                type="button"
              >
                SEND MESSAGE
              </UiButton>
            </form>
            <p v-else>Произвольное содержимое модального окна.</p>
          </UiModal>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ variant.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Длинное содержимое</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <UiModal
            label="LONG CONTENT"
            title="Scroll"
            accent="inside"
            :close-label="t('header.menuClose')"
          >
            <template #trigger="{ open }">
              <UiButton
                class="btn-secondary btn-sm"
                type="button"
                @click="open"
              >
                Открыть длинное
              </UiButton>
            </template>
            <p
              v-for="paragraph in paragraphs"
              :key="paragraph"
              class="text-sm/relaxed text-base-content/66"
            >
              Абзац {{ paragraph }}. Содержимое прокручивается внутри окна, а общая полоса прокрутки
              страницы блокируется без сдвига вёрстки.
            </p>
          </UiModal>
          <figcaption>
            <code class="text-xs text-brand-ink">slot default · overflow</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Управление снаружи</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <UiModal
            ref="modal"
            v-model="isOpen"
            label="CONTROLLED"
            title="Open from"
            accent="outside"
            :close-label="t('header.menuClose')"
            module="remote"
            @open="logEvent('open')"
            @close="logEvent('close')"
          >
            <p>Состояние окна живёт снаружи: v-model и методы open и close через ref.</p>
          </UiModal>
          <div class="flex flex-wrap gap-3">
            <UiButton
              class="btn-secondary btn-sm"
              type="button"
              @click="toggleOpen(true)"
            >
              v-model = true
            </UiButton>
            <UiButton
              class="btn-secondary btn-sm"
              type="button"
              @click="openByRef"
            >
              ref.open()
            </UiButton>
            <UiButton
              class="btn-secondary btn-sm"
              type="button"
              @click="closeByRef"
            >
              ref.close()
            </UiButton>
          </div>
          <p class="text-xs text-base-content/60">События: {{ log }}</p>
          <figcaption>
            <code class="text-xs text-brand-ink">
              v-model · defineExpose({ open, close }) · @open · @close
            </code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <UiModal
            label="SCOPE"
            title="Trigger slot"
            :close-label="t('header.menuClose')"
          >
            <template #trigger="{ open, isOpen: opened }">
              <UiButton
                class="btn-secondary btn-sm"
                type="button"
                :aria-expanded="opened"
                aria-haspopup="dialog"
                @click="open"
              >
                aria-expanded: {{ opened }}
              </UiButton>
            </template>
            <p>Слот trigger получает open, close и isOpen.</p>
          </UiModal>
          <figcaption>
            <code class="text-xs text-brand-ink">slot trigger="{ open, close, isOpen }"</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { definePageMeta } from "#imports";
import FormCheckbox from "~/components/form/FormCheckbox/FormCheckbox.vue";
import FormInput from "~/components/form/FormInput/FormInput.vue";
import FormTextarea from "~/components/form/FormTextarea/FormTextarea.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiModal from "~/components/ui/UiModal/UiModal.vue";

definePageMeta({ title: "Модальные окна" });

const { t } = useI18n();

const [isOpen, toggleOpen] = useToggle(false);
const modal = ref<InstanceType<typeof UiModal>>();
const events = ref<string[]>([]);
const log = computed(() => events.value.join(" → ") || "нет");

const paragraphs = Array.from({ length: 14 }, (_, index) => index + 1);

const variants = [
  {
    label: "Полное окно",
    caption: "label · title · accent · description · module",
    form: true,
    props: {
      label: "05 — CONTACT",
      title: "Let's grow",
      accent: "together",
      description: "Have a project in mind? Write to me — I usually reply within a day.",
      module: "contact",
    },
  },
  {
    label: "Только заголовок",
    caption: "title",
    form: false,
    props: { title: "Only a title" },
  },
  {
    label: "Без шапки текста",
    caption: "slot default",
    form: false,
    props: {},
  },
  {
    label: "Другой модуль",
    caption: 'module="projects"',
    form: false,
    props: { label: "03 — PROJECTS", title: "Selected", accent: "work", module: "projects" },
  },
];

function openByRef() {
  modal.value?.open();
}

function logEvent(name: string) {
  events.value = [...events.value, name].slice(-6);
}

function closeByRef() {
  modal.value?.close();
}
</script>
