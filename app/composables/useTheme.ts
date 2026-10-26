import { computed } from "vue";
import {
  createSharedComposable,
  useColorMode,
  useStorage,
  type BasicColorSchema,
} from "@vueuse/core";
import { tryUseNuxtApp } from "#imports";
import { DEFAULT_THEME, THEME, THEME_STORAGE_KEY, type ThemeId } from "~/assets/const";

const INSTANT_ATTR = "data-theme-instant";
const SETTLE_MS = 150;
const SERVER_SYSTEM_MODE = "dark";

function transitionMs() {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--default-transition-duration",
  );
  return Number.parseFloat(value) || 0;
}

export function readThemeSettleMs() {
  return transitionMs() + SETTLE_MS;
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
  }, readThemeSettleMs());
}

function applyInstantly(apply: () => void) {
  const root = document.documentElement;
  root.setAttribute(INSTANT_ATTR, "");
  apply();
  requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute(INSTANT_ATTR)));
}

function isThemeMode(mode: string): mode is keyof typeof THEME {
  return Object.hasOwn(THEME, mode);
}

function resolveMode<M extends string>(store: string, state: M) {
  return import.meta.server && store === "auto" ? SERVER_SYSTEM_MODE : state;
}

const useSharedColorMode = createSharedComposable(() => {
  const store = useStorage<BasicColorSchema>(THEME_STORAGE_KEY, "auto");
  let initialApplied = import.meta.server || !tryUseNuxtApp()?.isHydrating;

  function onChanged(state: string, apply: (mode: string) => void) {
    const mode = resolveMode(store.value, state);
    if (initialApplied) return apply(mode);
    initialApplied = true;
    const theme = isThemeMode(mode) ? THEME[mode] : undefined;
    if (document.documentElement.getAttribute("data-theme") === theme) return apply(mode);
    applyInstantly(() => apply(mode));
  }

  return useColorMode({
    attribute: "data-theme",
    modes: THEME,
    disableTransition: false,
    storageRef: store,
    onChanged,
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
