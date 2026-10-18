import { defineNuxtPlugin, useRouteBaseName, useRouter } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  router.beforeEach((to, from) => {
    const baseName = useRouteBaseName(nuxtApp);
    const samePage =
      baseName(to) === baseName(from) && JSON.stringify(to.params) === JSON.stringify(from.params);
    if (samePage) to.meta.scrollToTop = false;
  });
});
