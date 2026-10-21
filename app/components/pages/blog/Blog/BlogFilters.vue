<template>
  <div
    class="blog-filters"
    role="group"
    :aria-label="t('blog.filters.nav')"
  >
    <ul class="blog-filters-list">
      <li
        v-for="item in items"
        :key="item.key"
      >
        <button
          class="blog-filter"
          type="button"
          :aria-pressed="item.pressed"
          @click="item.select"
        >
          {{ item.label }}
          <span class="blog-filter-count">{{ item.count }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { BlogFilter, BlogFilterOption } from "./blogFilter";

const props = defineProps<{
  options: BlogFilterOption[];
  active: BlogFilter;
}>();

const emit = defineEmits<{
  select: [key: BlogFilter];
}>();

const { t } = useI18n();

const items = computed(() =>
  props.options.map((option) => ({
    key: option.key,
    label: t(`blog.filters.${option.key}`),
    count: option.count,
    pressed: option.key === props.active,
    select: () => emit("select", option.key),
  })),
);
</script>

<style src="./BlogFilters.css" />
