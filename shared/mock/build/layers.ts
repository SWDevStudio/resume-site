import { DEFAULT_LOCALE, type Locale } from "../../../app/assets/const/locale";
import type { ByLocale } from "../../types/catalog";

export function textLayers<T>(texts: ByLocale<T>, locale: Locale): T[] {
  const layers = [texts[locale], texts[DEFAULT_LOCALE]].filter((layer) => layer !== undefined);
  return [...new Set(layers)];
}

export function firstDefined<T, R>(layers: T[], pick: (layer: T) => R | undefined): R | undefined {
  for (const layer of layers) {
    const value = pick(layer);
    if (value !== undefined) return value;
  }
  return undefined;
}
