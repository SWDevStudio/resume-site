<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Бейджи</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="variant in variants"
          :key="variant.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiBadge :class="variant.modifier">{{ variant.label }}</UiBadge>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ variant.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Со статусом</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="status in statuses"
          :key="status.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiBadge>
            <span
              class="status"
              :class="status.modifier"
            />
            {{ status.label }}
          </UiBadge>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ status.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import UiBadge from "~/components/ui/UiBadge/UiBadge.vue";

definePageMeta({ title: "Бейджи" });

const variants = [
  { modifier: "", caption: "badge", label: "E-commerce" },
  { modifier: "badge-primary", caption: "badge badge-primary", label: "Payments" },
  { modifier: "badge-secondary", caption: "badge badge-secondary", label: "Accounts" },
  { modifier: "badge-accent", caption: "badge badge-accent", label: "Booking" },
  {
    modifier: "badge-ghost",
    caption: "badge badge-ghost",
    label: "I'm losing clients on my website…",
  },
];

const statuses = [
  { modifier: "", caption: "badge + status", label: "IDLE" },
  { modifier: "status-primary", caption: "badge + status status-primary", label: "BUSY" },
  { modifier: "status-secondary", caption: "badge + status status-secondary", label: "ONLINE" },
  { modifier: "status-accent", caption: "badge + status status-accent", label: "AWAY" },
  {
    modifier: "status-success",
    caption: "badge + status status-success",
    label: "OPEN TO PROJECTS",
  },
];
</script>
