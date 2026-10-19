<template>
  <nav
    class="the-footer-nav"
    :aria-label="t('footer.navLabel')"
  >
    <ul class="the-footer-links">
      <li
        v-for="link in links"
        :key="link.id"
      >
        <a
          class="the-footer-link"
          :href="link.href"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const items = [
  { id: "top", key: "home" },
  { id: "about", key: "about" },
  { id: "skills", key: "skills" },
  { id: "projects", key: "projects" },
  { id: "contact", key: "contact" },
] as const;

const links = computed(() =>
  items.map((item) => ({
    id: item.id,
    href: `#${item.id}`,
    label: t(`footer.nav.${item.key}`),
  })),
);
</script>

<style src="./TheFooterNav.css" />
