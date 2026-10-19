import { onMounted, ref, watch } from "vue";
import { useEventListener, useMutationObserver } from "@vueuse/core";

const DAY_THEME = "cyber-sakura";

export function useThemeLayers() {
  const day = ref(false);
  const nightShown = ref(true);
  const dayShown = ref(false);

  function sync() {
    day.value = document.documentElement.dataset.theme === DAY_THEME;
  }

  function showAll() {
    nightShown.value = true;
    dayShown.value = true;
  }

  watch(day, (value) => {
    if (value) dayShown.value = true;
    else nightShown.value = true;
  });

  onMounted(() => {
    sync();
    useMutationObserver(document.documentElement, sync, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    if (document.readyState === "complete") showAll();
    else useEventListener(window, "load", showAll, { once: true });
  });

  return { day, nightShown, dayShown };
}
