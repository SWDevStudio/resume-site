<template>
  <div class="home-why-body">
    <div
      ref="dialog"
      class="home-why-dialog"
      role="log"
      tabindex="0"
      aria-live="polite"
      :aria-label="t('home.why.chat.dialogLabel')"
      :aria-busy="busy"
    >
      <TransitionGroup
        tag="div"
        class="home-why-thread"
        name="home-why-message"
      >
        <WhyMessage
          key="greeting"
          :text="t('home.why.chat.greeting')"
        />
        <WhyMessage
          v-for="message in thread"
          :key="message.id"
          :role="message.role"
          :text="message.text"
          :status="message.status"
        />
      </TransitionGroup>
    </div>

    <form
      class="home-why-input"
      novalidate
      @submit.prevent="onSubmit"
    >
      <label class="home-why-field">
        <span
          class="home-why-prompt"
          aria-hidden="true"
        >
          &gt;
        </span>
        <input
          ref="input"
          v-model="draft"
          class="home-why-textbox ym-disable-keys"
          type="text"
          enterkeyhint="send"
          autocomplete="off"
          :maxlength="maxLength"
          :placeholder="t('home.why.chat.placeholder')"
          :aria-label="t('home.why.chat.inputLabel')"
          :disabled="inputDisabled"
          @focus="prepare"
        />
      </label>
      <UiButton
        class="home-why-ask"
        type="submit"
        :disabled="askDisabled"
        :aria-busy="busy"
      >
        {{ t("home.why.chat.ask") }}
        <span
          class="home-why-ask-icons"
          aria-hidden="true"
        >
          <UiIcon
            name="arrow-send"
            class="home-why-ask-arrow"
          />
          <UiIcon
            name="spinner"
            class="home-why-ask-spinner"
          />
        </span>
      </UiButton>
    </form>

    <div class="home-why-chips">
      <button
        v-for="chip in chips"
        :key="chip.key"
        class="home-why-chip"
        type="button"
        :disabled="busy"
        @click="onChip(chip.label)"
      >
        {{ chip.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiIcon from "~/components/ui/UiIcon/UiIcon.vue";
import WhyMessage from "./WhyMessage.vue";
import { useWhyChat } from "./useWhyChat";
import type { WhyMessageData } from "./useWhyChat";

const { t } = useI18n();
const dialog = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

const { messages, status, draft, busy, locked, canSend, maxLength, send, fill, prepare } =
  useWhyChat(dialog);
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

const chipKeys = ["clients", "developer", "website", "optimization"] as const;

const chips = computed(() =>
  chipKeys.map((key) => ({ key, label: t(`home.why.chat.chips.${key}`) })),
);

function textOf({ kind, text }: WhyMessageData) {
  return kind === "hint" ? t("home.why.chat.hint") : text;
}

const thread = computed(() =>
  messages.value.map((message) => ({ ...message, text: textOf(message) })),
);

const askDisabled = computed(() => !canSend.value);
const inputDisabled = computed(() => busy.value || locked.value);

function onSubmit() {
  if (canSend.value) void send();
}

async function onChip(label: string) {
  fill(label);
  await nextTick();
  const field = input.value;
  if (!field) return;
  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);
}

async function scrollDown() {
  await nextTick();
  const element = dialog.value;
  if (!element) return;
  element.scrollTo({
    top: element.scrollHeight,
    behavior: reduceMotion.value ? "auto" : "smooth",
  });
}

watch([messages, status], scrollDown, { deep: true });

watch(busy, async (now, before) => {
  if (!before || now) return;
  await nextTick();
  const active = document.activeElement;
  if (!active || active === document.body) input.value?.focus();
});
</script>

<style src="./WhyChat.css" />
