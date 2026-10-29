import { defineNuxtPlugin, useRouter } from "#imports";

function dropHash() {
  if (!location.hash) return;
  history.replaceState(history.state, "", location.pathname + location.search);
}

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  let entryHash = router.currentRoute.value.hash;

  router.beforeEach((to, from) => {
    if (nuxtApp.isHydrating && from.hash && !to.hash) to.meta.scrollToTop = false;
  });

  router.afterEach((to, _from, failure) => {
    if (failure) return;
    if (entryHash && to.hash === entryHash) {
      entryHash = "";
      return;
    }
    dropHash();
  });
});
