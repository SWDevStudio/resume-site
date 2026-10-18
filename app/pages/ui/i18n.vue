<template>
  <section class="flex flex-col gap-12">
    <h1 class="font-head text-5xl">{{ t("title") }}</h1>
    <p class="max-w-prose text-base-content/70">{{ t("lead") }}</p>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">
        {{ t("switch.heading") }}
      </h2>
      <div class="flex flex-wrap gap-3">
        <UiButton
          v-for="code in locales"
          :key="code"
          class="btn-sm"
          :class="code === locale ? 'btn-primary' : 'btn-ghost'"
          type="button"
          @click="setLocale(code)"
        >
          {{ names[code] }}
        </UiButton>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">
        {{ t("static.heading") }}
      </h2>
      <p class="max-w-prose">{{ t("static.paragraph") }}</p>
      <ul class="flex list-inside list-disc flex-col gap-2 text-base-content/80">
        <li>{{ t("static.list.first") }}</li>
        <li>{{ t("static.list.second") }}</li>
        <li>{{ t("static.list.third") }}</li>
      </ul>
    </div>

    <div class="flex flex-col gap-6">
      <h2 class="text-sm tracking-[.3em] text-base-content/60 uppercase">
        {{ t("remote.heading") }}
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm text-base-content/60">{{ t("remote.delay") }}</span>
        <UiButton
          v-for="value in delays"
          :key="value"
          class="btn-xs"
          :class="value === delay ? 'btn-primary' : 'btn-ghost'"
          type="button"
          @click="delay = value"
        >
          {{ value }}
        </UiButton>
      </div>
      <aside
        class="flex max-w-prose flex-col gap-2 border border-base-300 p-6"
        data-atom-async="i18n-demo-note"
      >
        <template v-if="note">
          <h3 class="font-head text-xl">{{ note.title }}</h3>
          <p class="text-sm text-base-content/80">{{ note.body }}</p>
        </template>
      </aside>
      <article
        class="flex max-w-prose flex-col gap-4 border border-base-300 p-6"
        data-atom-async="i18n-demo"
      >
        <template v-if="data">
          <h3 class="font-head text-2xl">{{ data.title }}</h3>
          <p class="text-base-content/80">{{ data.body }}</p>
          <ul class="flex flex-wrap gap-3">
            <li
              v-for="tag in data.tags"
              :key="tag"
              class="text-sm text-brand-ink"
            >
              #{{ tag }}
            </li>
          </ul>
          <p class="text-xs text-base-content/60">
            {{ t("remote.language") }}: {{ data.locale }} · {{ data.delay }} ms
          </p>
        </template>
        <p
          v-if="mounted && status === 'pending'"
          class="text-sm text-base-content/60"
        >
          {{ t("remote.pending") }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta, useAsyncData } from "#imports";
import type { Locale } from "~/assets/const";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import { useLocale } from "~/composables/useLocale";
import en from "~/locales/demo/en.json";
import ru from "~/locales/demo/ru.json";

interface DemoReply {
  locale: Locale;
  delay: number;
  title: string;
  body: string;
  tags: string[];
}

interface DemoNote {
  title: string;
  body: string;
}

definePageMeta({ title: "i18n" });

const { t } = useI18n({ useScope: "local", messages: { ru, en } });
const { locale, locales, setLocale } = useLocale();

const names: Record<Locale, string> = { ru: "Русский", en: "English" };
const delays = [1500, 4000, 7000];
const delay = ref(4000);
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

const articles: Record<Locale, Pick<DemoReply, "title" | "body" | "tags">> = {
  ru: {
    title: "Как сайт пересобирает себя на лету",
    body: "Ответ пришёл с бэкенда на языке запроса. Пока он летел по сети, текст на странице был облаком частиц, а теперь частицы собираются в новые слова.",
    tags: ["сеть", "частицы", "локаль"],
  },
  en: {
    title: "How a site rebuilds itself on the fly",
    body: "This reply came from the backend in the language of the request. While it travelled over the network, the text on the page was a cloud of particles, and now the particles are gathering into new words.",
    tags: ["network", "particles", "locale"],
  },
};

function fetchArticle(target: Locale, ms: number): Promise<DemoReply> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ locale: target, delay: ms, ...articles[target] }), ms);
  });
}

const notes: Record<Locale, DemoNote> = {
  ru: {
    title: "Быстрый блок",
    body: "Этот ответ пришёл быстро и собрался, не дожидаясь соседнего блока.",
  },
  en: {
    title: "Fast block",
    body: "This reply arrived quickly and gathered without waiting for the neighbouring block.",
  },
};

function fetchNote(target: Locale): Promise<DemoNote> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(notes[target]), 800);
  });
}

const { data: note } = await useAsyncData("i18n-demo-note", () => fetchNote(locale.value), {
  lazy: true,
  server: false,
});

const { data, status } = await useAsyncData(
  "i18n-demo",
  () => fetchArticle(locale.value, delay.value),
  { lazy: true, server: false, watch: [delay] },
);
</script>
