import { computed } from "vue";
import { useColorMode } from "@vueuse/core";
import { DEFAULT_THEME, THEME, type ThemeId } from "~/assets/const";

export function useTheme() {
  const mode = useColorMode({
    attribute: "data-theme",
    modes: THEME,
    disableTransition: false,
  });

  const current = computed<ThemeId>(
    () => THEME[mode.state.value as keyof typeof THEME] ?? DEFAULT_THEME,
  );

  function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
  }

  return { mode, current, toggle };
}
