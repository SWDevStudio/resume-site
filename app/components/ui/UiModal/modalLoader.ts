import type { Component } from "vue";
import { DEFAULT_THEME, type ThemeId } from "~/assets/const";
import { importBloom, importHolo, importWindow } from "./modalImports";

const THEME_IMPORTS: Partial<Record<ThemeId, () => Promise<unknown>>> = {
  "torii-synth": () => importHolo(),
  "cyber-sakura": () => importBloom(),
};

let pending: Promise<Component> | undefined;

function noop() {
  return undefined;
}

async function twice<T>(load: () => Promise<T>) {
  try {
    return await load();
  } catch {
    return load();
  }
}

export function activeModalTheme(): ThemeId {
  const id = document.documentElement.dataset.theme as ThemeId | undefined;
  return id && id in THEME_IMPORTS ? id : DEFAULT_THEME;
}

export function loadModalLayers(theme: ThemeId) {
  const load = THEME_IMPORTS[theme];
  return load ? twice(load).catch(noop) : Promise.resolve(undefined);
}

async function load() {
  const layers = loadModalLayers(activeModalTheme());
  const module = await twice(() => importWindow());
  await layers;
  return module.default as Component;
}

export function loadModalWindow() {
  pending ??= load().catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}

export function resetModalWindowLoader() {
  pending = undefined;
}
