import { defineNuxtPlugin, onNuxtReady, useRouter } from "#imports";

function dropHash() {
  if (!location.hash) return;
  history.replaceState(history.state, "", location.pathname + location.search);
}

export default defineNuxtPlugin(() => {
  useRouter().afterEach((_to, _from, failure) => {
    if (!failure) dropHash();
  });
  onNuxtReady(dropHash);
});
