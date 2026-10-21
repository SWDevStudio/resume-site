<template>
  <nav
    ref="root"
    class="page-sections-nav"
    :class="rootClass"
    :aria-labelledby="titleId"
  >
    <span
      class="page-sections-nav-frame"
      aria-hidden="true"
    />
    <component
      :is="headTag"
      ref="head"
      class="page-sections-nav-head"
      v-bind="headAttrs"
      @click="toggle()"
    >
      <span class="page-sections-nav-text">
        <span
          :id="titleId"
          class="page-sections-nav-title"
        >
          {{ title }}
        </span>
        <span class="page-sections-nav-summary">{{ summary }}</span>
      </span>
      <span
        class="page-sections-nav-chevron"
        aria-hidden="true"
      />
    </component>
    <div
      :id="panelId"
      class="page-sections-nav-panel"
    >
      <span
        class="page-sections-nav-frame"
        aria-hidden="true"
      />
      <div class="page-sections-nav-scroll">
        <PageSectionsNavList
          :nodes="registry.nodes.value"
          :active="registry.active.value"
          :depth="0"
          @select="toggle(false)"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { onClickOutside, useEventListener, useMediaQuery, useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import PageSectionsNavList from "./PageSectionsNavList.vue";
import { useSectionsRegistry } from "./usePageSections";

const props = withDefaults(
  defineProps<{
    title: string;
    countRoots?: boolean;
    countKey?: string;
  }>(),
  { countKey: "pageSections.count" },
);

const { t } = useI18n();
const registry = useSectionsRegistry();

const uid = useId();
const titleId = `page-sections-title-${uid}`;
const panelId = `page-sections-panel-${uid}`;

const root = ref<HTMLElement | null>(null);
const head = ref<HTMLElement | null>(null);

const [open, toggle] = useToggle(false);
const wide = useMediaQuery("(min-width: 64rem)");

const headTag = computed(() => (wide.value ? "div" : "button"));
const headAttrs = computed(() =>
  wide.value ? {} : { type: "button", "aria-expanded": open.value, "aria-controls": panelId },
);
const rootClass = computed(() => ({ "page-sections-nav-open": open.value }));

const activeName = computed(
  () => registry.flat.value.find((node) => node.id === registry.active.value)?.name ?? "",
);
const count = computed(() =>
  props.countRoots ? registry.nodes.value.length : registry.flat.value.length,
);
const summary = computed(
  () => `${activeName.value} · ${t(props.countKey, { count: count.value }, count.value)}`,
);

function close() {
  toggle(false);
}

function closeAndFocus() {
  if (!open.value) return;
  close();
  head.value?.focus();
}

watch(wide, close);
onClickOutside(root, close);
useEventListener(root, "keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") closeAndFocus();
});
</script>

<style src="./PageSectionsNav.css" />
