<template>
  <header class="the-header">
    <div
      ref="barRef"
      class="the-header-bar container"
      @keydown.esc="closeAll"
    >
      <NuxtLinkLocale
        class="the-header-logo"
        :to="Route.home"
      >
        <span>SOWA</span>
        <span class="the-header-logo-dash">_</span>
        <span>DEV</span>
      </NuxtLinkLocale>

      <div class="the-header-end">
        <nav
          :id="navId"
          class="the-header-nav"
          :class="navClass"
          :aria-label="t('header.nav')"
          @click="toggleMenu(false)"
        >
          <ul>
            <li
              v-for="link in links"
              :key="link.key"
            >
              <NuxtLinkLocale
                class="the-header-link"
                :to="link.to"
              >
                {{ link.label }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>

        <TheHeaderThemeSwitch />

        <TheHeaderLangSwitch
          ref="langRef"
          @open="toggleMenu(false)"
        />

        <button
          class="the-header-burger"
          type="button"
          :aria-expanded="menuOpen"
          :aria-controls="navId"
          :aria-label="burgerLabel"
          @click="toggleBurger"
        >
          <span
            class="the-header-burger-frame"
            aria-hidden="true"
          />
          <span
            class="the-header-burger-icon"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { onClickOutside, useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { NuxtLinkLocale } from "#components";
import { Route } from "~/assets/const";
import TheHeaderLangSwitch from "./TheHeaderLangSwitch.vue";
import TheHeaderThemeSwitch from "./TheHeaderThemeSwitch.vue";

const items = [
  { key: "home", label: "nav.home", to: Route.home },
  { key: "resume", label: "nav.resume", to: Route.resume },
  // { key: "blog", label: "nav.blog", to: Route.blog },
  { key: "projects", label: "nav.projects", to: Route.projects },
] as const;

const { t } = useI18n();

const navId = useId();
const barRef = ref<HTMLElement>();
const langRef = ref<InstanceType<typeof TheHeaderLangSwitch>>();
const [menuOpen, toggleMenu] = useToggle(false);

const navClass = computed(() => ({ "the-header-nav-open": menuOpen.value }));

const links = computed(() =>
  items.map((item) => ({
    key: item.key,
    to: item.to,
    label: t(item.label),
  })),
);

const burgerLabel = computed(() => (menuOpen.value ? t("header.menuClose") : t("header.menu")));

function toggleBurger() {
  toggleMenu();
  langRef.value?.close();
}

function closeAll() {
  toggleMenu(false);
  langRef.value?.close();
}

onClickOutside(barRef, () => toggleMenu(false));
</script>

<style src="./TheHeader.css" />
