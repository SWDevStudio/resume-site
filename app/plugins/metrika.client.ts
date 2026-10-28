import { watch } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import { defineNuxtPlugin, onNuxtReady, useError, useRouter, useSafeRuntimeConfig } from "#imports";
import { $metrika } from "~/assets/metrika";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function counterId(value: string | number) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default defineNuxtPlugin((nuxtApp) => {
  const id = counterId(useSafeRuntimeConfig().public.yandexMetrikaId);
  if (import.meta.dev || id === null || LOCAL_HOSTS.has(location.hostname)) return;

  const router = useRouter();

  function pageUrl(route: RouteLocationNormalized) {
    const url = new URL(router.resolve(route.fullPath).href, location.origin);
    url.hash = "";
    return url.href;
  }

  $metrika.init(id);

  router.afterEach((to, from, failure) => {
    if (failure) return;
    $metrika.navigate(pageUrl(to), pageUrl(from));
  });

  nuxtApp.hook("page:loading:end", $metrika.hit);

  watch(
    useError(),
    (error) => {
      if (error) $metrika.hit();
    },
    { flush: "post" },
  );

  onNuxtReady($metrika.loadTag);
});
