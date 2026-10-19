import { computed, onMounted, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";
import { useTheme } from "~/composables/useTheme";

export function useThemeLayers<T>(registry: Partial<Record<ThemeId, T>>) {
  const { current } = useTheme();
  const ids = Object.keys(registry) as ThemeId[];
  const mounted = ref(false);
  const loaded = ref<ThemeId[]>([DEFAULT_THEME]);

  const active = computed<ThemeId>(() => {
    const id = mounted.value ? current.value : DEFAULT_THEME;
    return ids.includes(id) ? id : DEFAULT_THEME;
  });

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
