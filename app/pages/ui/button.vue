<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">Кнопки</h1>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Варианты</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure
          v-for="variant in variants"
          :key="variant.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiButton
            :class="variant.modifier"
            type="button"
          >
            Projects
          </UiButton>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ variant.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Размеры</h2>
      <div class="flex flex-wrap items-end gap-x-6 gap-y-10">
        <figure
          v-for="size in sizes"
          :key="size.caption"
          class="flex flex-col items-start gap-3"
        >
          <UiButton
            :class="size.modifier"
            type="button"
          >
            {{ size.label }}
          </UiButton>
          <figcaption>
            <code class="text-xs text-brand-ink">{{ size.caption }}</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Состояния</h2>
      <div class="flex flex-wrap items-start gap-x-6 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <UiButton
            type="button"
            disabled
          >
            Send message
          </UiButton>
          <figcaption>
            <code class="text-xs text-brand-ink">btn :disabled</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <UiButton
            class="btn-disabled btn-primary"
            type="button"
          >
            Send message
          </UiButton>
          <figcaption>
            <code class="text-xs text-brand-ink">btn btn-primary btn-disabled</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Без рамки и иконки</h2>
      <div class="flex flex-wrap items-start gap-x-12 gap-y-10">
        <figure class="flex flex-col items-start gap-3">
          <a
            class="btn btn-ghost"
            href="#"
          >
            Live site
            <svg
              class="size-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M2 8H13M9 3.5L13.5 8L9 12.5" />
            </svg>
          </a>
          <figcaption>
            <code class="text-xs text-brand-ink">btn btn-ghost</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <a
            class="btn btn-link"
            href="#"
          >
            Read case &lt;/&gt;
          </a>
          <figcaption>
            <code class="text-xs text-brand-ink">btn btn-link</code>
          </figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-3">
          <div class="flex gap-2.5">
            <a
              v-for="social in socials"
              :key="social.name"
              class="btn btn-square"
              href="#"
              :aria-label="social.name"
            >
              <svg
                class="size-5.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
          <figcaption>
            <code class="text-xs text-brand-ink">btn btn-square</code>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">Во всю ширину</h2>
      <figure class="flex max-w-sm flex-col items-start gap-3">
        <UiButton
          class="btn-block btn-primary"
          type="button"
        >
          Send message
        </UiButton>
        <figcaption>
          <code class="text-xs text-brand-ink">btn btn-primary btn-block</code>
        </figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-3">
        <a
          class="btn btn-block btn-gradient"
          href="#"
        >
          My latest projects
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M2 8H13M9 3.5L13.5 8L9 12.5" />
          </svg>
        </a>
        <figcaption>
          <code class="text-xs text-brand-ink">btn btn-gradient btn-block</code>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import UiButton from "~/components/ui/UiButton/UiButton.vue";

definePageMeta({ title: "Кнопки" });

const variants = [
  { modifier: "", caption: "btn" },
  { modifier: "btn-primary", caption: "btn btn-primary" },
  { modifier: "btn-secondary", caption: "btn btn-secondary" },
  { modifier: "btn-accent", caption: "btn btn-accent" },
];

const sizes = [
  { modifier: "btn-xs", caption: "btn btn-xs", label: "OK" },
  { modifier: "btn-sm", caption: "btn btn-sm", label: "Ask" },
  { modifier: "btn-md", caption: "btn btn-md", label: "Send message" },
  { modifier: "btn-lg", caption: "btn btn-lg", label: "Download my CV" },
  { modifier: "btn-xl", caption: "btn btn-xl", label: "Contact me" },
];

const socials = [
  { name: "Telegram", icon: "M21 4L3 11L10 13.5M21 4L18 20L10 13.5M21 4L10 13.5M10 13.5V19L13 16" },
  {
    name: "LinkedIn",
    icon: "M4 9V20M4 4.5V5M9 20V9M9 13.5C9 11 10.5 9 13 9C15.5 9 16 11 16 13V20M20 20V13",
  },
  {
    name: "GitHub",
    icon: "M9 19C5 20.5 5 17 3 16.5M15 21V17.5C15 16.5 15.1 16.1 14.5 15.5C17.3 15.2 20 14.1 20 9.5C20 8.3 19.6 7.2 18.8 6.3C19.2 5.3 19.2 4.1 18.7 3C18.7 3 17.6 2.7 15 4.4C12.9 3.8 11.1 3.8 9 4.4C6.4 2.7 5.3 3 5.3 3C4.8 4.1 4.8 5.3 5.2 6.3C4.4 7.2 4 8.3 4 9.5C4 14.1 6.7 15.2 9.5 15.5C8.9 16.1 8.9 16.7 9 17.5V21",
  },
];
</script>
