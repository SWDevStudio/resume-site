<template>
  <div
    class="home-why-message"
    :class="{ 'home-why-message-user': isUser }"
  >
    <span
      v-if="isAssistant"
      class="home-why-avatar"
      aria-hidden="true"
    >
      {{ t("home.why.chat.avatar") }}
    </span>
    <p
      class="home-why-bubble"
      :class="{
        'home-why-bubble-user': isUser,
        'home-why-bubble-streaming': streaming,
        'home-why-bubble-error': failed,
      }"
    >
      <template v-if="waiting">
        <span
          class="home-why-typing"
          aria-hidden="true"
        >
          <span class="home-why-typing-dot" />
          <span class="home-why-typing-dot" />
          <span class="home-why-typing-dot" />
        </span>
        <span class="sr-only">{{ t("home.why.chat.typing") }}</span>
      </template>
      <template v-else>{{ content }}</template>
      <span
        v-if="isAssistant"
        class="home-why-cursor"
        aria-hidden="true"
      />
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { WhyMessageStatus, WhyRole } from "./useWhyChat";

const props = withDefaults(
  defineProps<{
    role?: WhyRole;
    text?: string;
    status?: WhyMessageStatus;
  }>(),
  { role: "assistant", text: "", status: "done" },
);

const { t } = useI18n();

const isUser = computed(() => props.role === "user");
const isAssistant = computed(() => props.role === "assistant");
const waiting = computed(() => props.status === "waiting");
const streaming = computed(() => props.status === "streaming");
const failed = computed(() => props.status === "error");
const content = computed(() => (failed.value ? t("home.why.chat.error") : props.text));
</script>

<style src="./WhyMessage.css" />
