import { useColorMode } from "@vueuse/core";
import { THEME } from "~/assets/const";

export function useTheme() {
  const mode = useColorMode({
    attribute: "data-theme",
    modes: THEME,
    disableTransition: false,
  });

  function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
  }

  return { mode, toggle };
}
