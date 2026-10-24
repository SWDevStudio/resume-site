import { computed, onMounted, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useNuxtApp, useState } from "#imports";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";
import { useTheme } from "~/composables/useTheme";

export function useThemeLayers<T>(registry: Partial<Record<ThemeId, T>>) {
  const { current } = useTheme();
  const { isHydrating } = useNuxtApp();
  const rendered = useState<ThemeId>("theme-layers-rendered", () => current.value);
  const ids = Object.keys(registry) as ThemeId[];
  const initial = isHydrating ? rendered.value : current.value;
  const mounted = ref(false);

  function resolve(id: ThemeId) {
    return ids.includes(id) ? id : DEFAULT_THEME;
  }

  const loaded = ref<ThemeId[]>([resolve(initial)]);

  const active = computed<ThemeId>(() => resolve(mounted.value ? current.value : initial));

  const layers = computed(() =>
    ids
      .filter((id) => loaded.value.includes(id))
      .map((id) => ({ theme: id, entry: registry[id] as T, paused: id !== active.value })),
  );

  function load(id: ThemeId) {
    if (!loaded.value.includes(id)) loaded.value.push(id);
  }

  function loadAll() {
    ids.forEach(load);
  }

  watch(active, load);

  onMounted(() => {
    mounted.value = true;
    if (document.readyState === "complete") loadAll();
    else useEventListener(window, "load", loadAll, { once: true });
  });

  return { active, layers };
}
