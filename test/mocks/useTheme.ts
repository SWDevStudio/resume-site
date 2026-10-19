import { computed, ref } from "vue";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";

const current = ref<ThemeId>(DEFAULT_THEME);

export function useTheme() {
  return {
    mode: ref("auto"),
    current: computed(() => current.value),
    toggle: () => undefined,
  };
}

export function setTheme(id: string) {
  document.documentElement.dataset.theme = id;
  current.value = id as ThemeId;
}
