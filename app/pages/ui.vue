<template>
  <div class="flex min-h-screen flex-col font-body text-base-content md:flex-row">
    <aside
      class="flex shrink-0 flex-col gap-6 border-b border-base-300 p-6 md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0 md:py-8"
    >
      <NuxtLinkLocale
        class="font-head text-2xl"
        to="/ui"
      >
        Sawa UI
      </NuxtLinkLocale>
      <nav class="flex flex-wrap gap-x-4 gap-y-2 md:flex-col">
        <NuxtLinkLocale
          v-for="item in items"
          :key="item.name"
          class="text-sm tracking-[.2em] text-base-content/60 uppercase hover:text-base-content"
          active-class="text-brand-ink!"
          :to="{ name: item.name }"
        >
          {{ item.title }}
        </NuxtLinkLocale>
      </nav>
    </aside>

    <div class="flex min-w-0 grow flex-col">
      <header
        class="sticky top-0 z-10 flex items-center justify-end bg-base-100/85 px-8 py-4 backdrop-blur-md"
      >
        <UiButton
          class="btn-sm"
          type="button"
          @click="toggle"
        >
          Сменить тему
        </UiButton>
      </header>

      <main class="px-8 pt-8 pb-24">
        <p
          v-if="isIndex"
          class="text-base-content/60"
        >
          Выберите компонент в меню.
        </p>
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NuxtLinkLocale, NuxtPage } from "#components";
import { definePageMeta, useRoute, useRouteBaseName, useRouter } from "#imports";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useTheme } from "~/composables/useTheme";

definePageMeta({ layout: false });

const { toggle } = useTheme();
const route = useRoute();
const baseName = useRouteBaseName();
const isIndex = computed(() => baseName(route) === "ui");

const items = Array.from(
  new Map(
    useRouter()
      .getRoutes()
      .flatMap((page) => {
        const name = baseName(String(page.name ?? ""));
        return name?.startsWith("ui-") && typeof page.meta.title === "string"
          ? [[name, String(page.meta.title)] as const]
          : [];
      }),
  ),
  ([name, title]) => ({ name, title }),
).sort((a, b) => a.title.localeCompare(b.title));
</script>
