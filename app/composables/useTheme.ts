import { computed } from "vue";
import {
  createSharedComposable,
  useColorMode,
  useStorage,
  type BasicColorSchema,
} from "@vueuse/core";
import { DEFAULT_THEME, THEME, type ThemeId } from "~/assets/const";

const INSTANT_ATTR = "data-theme-instant";
const SETTLE_MS = 150;
const STORAGE_KEY = "vueuse-color-scheme";
const SERVER_SYSTEM_MODE = "dark";

function transitionMs() {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--default-transition-duration",
  );
  return Number.parseFloat(value) || 0;
}

function isOffscreen(element: Element) {
  const { top, right, bottom, left, width, height } = element.getBoundingClientRect();
  if (width === 0 && height === 0) return false;
  return bottom <= 0 || top >= window.innerHeight || right <= 0 || left >= window.innerWidth;
}

function collectHidden(parent: Element, hidden: Element[]) {
  for (const child of parent.children) {
    if (isOffscreen(child)) hidden.push(child);
    else collectHidden(child, hidden);
  }
}

function freezeHiddenElements() {
  const hidden: Element[] = [];
  collectHidden(document.body, hidden);
  for (const element of hidden) element.setAttribute(INSTANT_ATTR, "");
  setTimeout(() => {
    for (const element of hidden) element.removeAttribute(INSTANT_ATTR);
  }, transitionMs() + SETTLE_MS);
}

function resolveMode<M extends string>(store: string, state: M) {
  return import.meta.server && store === "auto" ? SERVER_SYSTEM_MODE : state;
}

const useSharedColorMode = createSharedComposable(() => {
  const store = useStorage<BasicColorSchema>(STORAGE_KEY, "auto");
  return useColorMode({
    attribute: "data-theme",
    modes: THEME,
    disableTransition: false,
    storageRef: store,
    onChanged: (state, apply) => apply(resolveMode(store.value, state)),
  });
});

export function useTheme() {
  const mode = useSharedColorMode();

  const current = computed<ThemeId>(
    () =>
      THEME[resolveMode(mode.store.value, mode.state.value) as keyof typeof THEME] ?? DEFAULT_THEME,
  );

  function toggle() {
    freezeHiddenElements();
    mode.value = mode.value === "dark" ? "light" : "dark";
  }

  return { mode, current, toggle };
}
