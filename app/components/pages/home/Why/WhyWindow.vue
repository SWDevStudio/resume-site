<template>
  <div class="home-why-window">
    <div class="home-why-edge">
      <div class="home-why-pane">
        <div class="home-why-bar">
          <div class="home-why-bar-title">
            <span
              class="home-why-dots"
              aria-hidden="true"
            >
              <span class="home-why-dot" />
              <span class="home-why-dot" />
              <span class="home-why-dot" />
            </span>
            <span class="home-why-name">
              {{ t("home.why.chat.name") }}
              <span class="home-why-role">{{ t("home.why.chat.role") }}</span>
            </span>
          </div>
          <span class="home-why-status">
            <span
              class="home-why-status-dot"
              aria-hidden="true"
            />
            {{ t("home.why.chat.status") }}
          </span>
        </div>

        <WhyChat />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import WhyChat from "./WhyChat.vue";

const { t } = useI18n();
</script>

<style src="./WhyWindow.css" />
