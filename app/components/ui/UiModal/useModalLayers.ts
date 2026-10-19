import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";

export function useModalLayers<T>(registry: Partial<Record<ThemeId, T>>) {
  const attribute = ref<string | undefined>(document.documentElement.dataset.theme);
  const seen = ref<ThemeId[]>([]);
  let observer: MutationObserver | undefined;

  function read() {
    attribute.value = document.documentElement.dataset.theme;
  }

  const active = computed<ThemeId>(() => {
    const id = attribute.value as ThemeId | undefined;
    return id && id in registry ? id : DEFAULT_THEME;
  });

  watch(
    active,
    (id) => {
      if (!seen.value.includes(id)) seen.value = [...seen.value, id];
    },
    { immediate: true },
  );

  onMounted(() => {
    read();
    observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  });

  onBeforeUnmount(() => observer?.disconnect());

  function reset() {
    read();
    seen.value = [active.value];
  }

  const layers = computed(() =>
    seen.value.flatMap((theme, index) => {
      const entry = registry[theme];
      return entry ? [{ theme, entry, late: index > 0 }] : [];
    }),
  );

  return { layers, reset };
}
