<template>
  <div
    ref="rootRef"
    class="the-header-lang"
  >
    <button
      class="the-header-tool the-header-lang-trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      :aria-label="triggerLabel"
      @click="toggleMenu"
    >
      <span
        class="the-header-lang-globe"
        aria-hidden="true"
      />
      <span class="the-header-lang-code">{{ triggerCode }}</span>
      <span
        class="the-header-lang-chevron"
        aria-hidden="true"
      />
      <span
        class="the-header-lang-bar"
        aria-hidden="true"
      />
      <span
        class="the-header-lang-hatch"
        aria-hidden="true"
      />
    </button>

    <ul
      :id="menuId"
      class="the-header-menu"
      :class="menuClass"
    >
      <li
        v-for="item in menuItems"
        :key="item.code"
      >
        <button
          class="the-header-menu-item"
          type="button"
          :lang="item.code"
          :aria-current="item.current"
          @click="selectLocale(item.code)"
        >
          <span class="the-header-menu-code">{{ item.label }}</span>
          <span class="the-header-menu-name">{{ item.name }}</span>
          <span
            class="the-header-menu-check"
            aria-hidden="true"
          />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { onClickOutside, useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import type { Locale } from "~/assets/const";
import { useLocale } from "~/composables/useLocale";

const emit = defineEmits<{ open: [] }>();

const LOCALE_NAMES: Record<Locale, string> = { ru: "Русский", en: "English" };

const { t } = useI18n();
const { locale, locales, prepare, setLocale } = useLocale();

const menuId = useId();
const rootRef = ref<HTMLElement>();
const [isOpen, toggleOpen] = useToggle(false);

const triggerCode = computed(() => locale.value.toUpperCase());
const triggerLabel = computed(
  () => `${triggerCode.value}, ${t("header.language", { name: LOCALE_NAMES[locale.value] })}`,
);
const menuClass = computed(() => ({ "the-header-menu-open": isOpen.value }));

const menuItems = computed(() =>
  locales.map((code) => ({
    code,
    label: code.toUpperCase(),
    name: LOCALE_NAMES[code],
    current: code === locale.value ? ("true" as const) : undefined,
  })),
);

function close() {
  toggleOpen(false);
}

function toggleMenu() {
  toggleOpen();
  if (!isOpen.value) return;
  prepare();
  emit("open");
}

onClickOutside(rootRef, close);

function selectLocale(code: Locale) {
  close();
  setLocale(code);
}

defineExpose({ close });
</script>

<style src="./TheHeaderLangSwitch.css" />
