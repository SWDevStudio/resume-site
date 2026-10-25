import { watch } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import { defineNuxtPlugin, onNuxtReady, useError, useRouter, useSafeRuntimeConfig } from "#imports";

const TAG_URL = "https://mc.yandex.ru/metrika/tag.js";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

interface PendingHit {
  url: string;
  referer: string;
}

function counterId(value: string | number) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function createQueue(): YandexMetrika {
  const queue: unknown[][] = [];
  const enqueue = (...args: unknown[]) => {
    queue.push(args);
  };
  return Object.assign(enqueue, { a: queue, l: Date.now() });
}

function loadTag(id: number) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `${TAG_URL}?id=${id}`;
  document.head.append(script);
}

export default defineNuxtPlugin((nuxtApp) => {
  const id = counterId(useSafeRuntimeConfig().public.yandexMetrikaId);
  if (import.meta.dev || id === null || LOCAL_HOSTS.has(location.hostname)) return;

  const router = useRouter();
  let pending: PendingHit | null = null;

  function pageUrl(route: RouteLocationNormalized) {
    const url = new URL(router.resolve(route.fullPath).href, location.origin);
    url.hash = "";
    return url.href;
  }

  const sendHit = () => {
    if (!pending) return;
    const { url, referer } = pending;
    pending = null;
    setTimeout(() => {
      window.ym?.(id, "hit", url, { referer, title: document.title });
    }, 0);
  };

  window.ym ||= createQueue();
  window.ym(id, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    referrer: document.referrer,
    url: location.href,
  });

  router.afterEach((to, from, failure) => {
    if (failure) return;
    const url = pageUrl(to);
    const referer = pageUrl(from);
    const changed = url !== referer;
    pending = changed ? { url, referer } : null;
  });

  nuxtApp.hook("page:loading:end", sendHit);

  watch(
    useError(),
    (error) => {
      if (error) sendHit();
    },
    { flush: "post" },
  );

  onNuxtReady(() => loadTag(id));
});
