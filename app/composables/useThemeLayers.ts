import { computed, onMounted, ref, watch } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import { useNuxtApp, useState } from "#imports";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";
import { readThemeSettleMs, useTheme } from "~/composables/useTheme";

const PREFETCH_KEY = "theme-layers-prefetch";

export function useThemeLayersPrefetch() {
  const requests = useState<number>(PREFETCH_KEY, () => 0);

  function prefetch() {
    requests.value += 1;
  }

  return { prefetch };
}

export function useThemeLayers<T>(registry: Partial<Record<ThemeId, T>>) {
  const { current } = useTheme();
  const { isHydrating } = useNuxtApp();
  const rendered = useState<ThemeId>("theme-layers-rendered", () => current.value);
  const requests = useState<number>(PREFETCH_KEY, () => 0);
  const ids = Object.keys(registry) as ThemeId[];
  const initial = isHydrating ? rendered.value : current.value;
  const mounted = ref(false);

  function resolve(id: ThemeId) {
    return ids.includes(id) ? id : DEFAULT_THEME;
  }

  const loaded = ref<ThemeId[]>([resolve(initial)]);
  const late = ref<ThemeId[]>([]);

  const active = computed<ThemeId>(() => resolve(mounted.value ? current.value : initial));

  const layers = computed(() =>
    ids
      .filter((id) => loaded.value.includes(id))
      .map((id) => ({
        theme: id,
        entry: registry[id] as T,
        paused: id !== active.value,
        late: late.value.includes(id),
      })),
  );

  function load(id: ThemeId) {
    if (loaded.value.includes(id)) return;
    loaded.value.push(id);
    if (!late.value.includes(id)) late.value.push(id);
  }

  function unloadInactive() {
    loaded.value = loaded.value.filter((id) => id === active.value);
  }

  const { start: scheduleUnload } = useTimeoutFn(unloadInactive, readThemeSettleMs, {
    immediate: false,
  });

  watch(active, (id) => {
    load(id);
    scheduleUnload();
  });

  watch(requests, () => ids.forEach(load));

  onMounted(() => {
    mounted.value = true;
  });

  return { active, layers };
}
