<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Статистика</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Цвета</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure
          v-for="variant in variants"
          :key="variant.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiStat :class="variant.modifier">
            <template #value>{{ variant.value }}</template>
            {{ variant.title }}
          </UiStat>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ variant.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Ряд</h2>
      <figure class="flex flex-col items-start gap-3">
        <div class="stats">
          <UiStat
            v-for="variant in variants"
            :key="variant.caption"
            :class="variant.modifier"
          >
            <template #value>{{ variant.value }}</template>
            {{ variant.title }}
          </UiStat>
        </div>
        <figcaption>
          <code class="text-xs text-brand-ink">stats stat</code>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import UiStat from "~/components/ui/UiStat/UiStat.vue";

definePageMeta({ title: "Статистика" });

const variants = [
  { modifier: "stat-primary", caption: "stat stat-primary", value: "8+", title: "YEARS" },
  { modifier: "stat-accent", caption: "stat stat-accent", value: "40", title: "PROJECTS" },
  { modifier: "stat-secondary", caption: "stat stat-secondary", value: "95", title: "LIGHTHOUSE" },
];
</script>
