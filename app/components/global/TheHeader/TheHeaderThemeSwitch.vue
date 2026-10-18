<template>
  <button
    class="the-header-tool the-header-theme"
    type="button"
    :aria-label="t('theme.toggle')"
    @click="toggle"
  >
    <img
      class="the-header-theme-icon the-header-theme-icon-dark"
      :src="toriiSynthIcon"
      alt=""
      aria-hidden="true"
    />
    <img
      class="the-header-theme-icon the-header-theme-icon-light"
      :src="cyberSakuraIcon"
      alt=""
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "~/composables/useTheme";
import cyberSakuraIcon from "./media/theme-cyber-sakura.svg";
import toriiSynthIcon from "./media/theme-torii-synth.svg";

const { t } = useI18n();
const { toggle } = useTheme();
</script>

<style src="./TheHeaderThemeSwitch.css" />
