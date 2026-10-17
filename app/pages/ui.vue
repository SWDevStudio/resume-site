<template>
  <div class="flex min-h-screen flex-col font-body text-base-content md:flex-row">
    <aside
      class="flex shrink-0 flex-col gap-6 border-b border-base-300 p-6 md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0 md:py-8"
    >
      <NuxtLink class="font-head text-2xl" to="/ui">Sawa UI</NuxtLink>
      <nav class="flex flex-wrap gap-x-4 gap-y-2 md:flex-col">
        <NuxtLink
          v-for="item in items"
          :key="item.path"
          class="text-sm tracking-[.2em] text-base-content/60 uppercase hover:text-base-content"
          active-class="text-brand-ink!"
          :to="item.path"
        >
          {{ item.title }}
        </NuxtLink>
      </nav>
    </aside>

    <div class="flex min-w-0 grow flex-col">
      <header
        class="sticky top-0 z-10 flex items-center justify-end bg-base-100/85 px-8 py-4 backdrop-blur-md"
      >
        <UiButton class="btn-sm" type="button" @click="toggle">Сменить тему</UiButton>
      </header>

      <main class="px-8 pt-8 pb-24">
        <p v-if="route.name === 'ui'" class="text-base-content/60">Выберите компонент в меню.</p>
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink, NuxtPage } from "#components";
import { useRoute, useRouter } from "#imports";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useTheme } from "~/composables/useTheme";

const { toggle } = useTheme();
const route = useRoute();

const items = useRouter()
  .getRoutes()
  .filter((page) => page.path.startsWith("/ui/") && typeof page.meta.title === "string")
  .map((page) => ({ path: page.path, title: String(page.meta.title) }))
  .sort((a, b) => a.title.localeCompare(b.title));
</script>
