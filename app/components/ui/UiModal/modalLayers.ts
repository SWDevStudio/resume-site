import { defineAsyncComponent, type Component } from "vue";
import type { ThemeId } from "~/assets/const";
import { importBloom, importHolo } from "./modalImports";

export type ModalLayerSlot = "spark" | "window" | "inner";

export type ModalLayers = Record<ModalLayerSlot, Component[]>;

function part<M extends Record<string, Component>>(load: () => Promise<M>, name: keyof M & string) {
  return defineAsyncComponent({
    loader: () => load().then((module) => module[name] as Component),
    onError(error, retry, fail, attempts) {
      if (attempts <= 1) retry();
      else fail();
    },
  });
}

export const MODAL_LAYERS: Partial<Record<ThemeId, ModalLayers>> = {
  "torii-synth": {
    spark: [part(importHolo, "UiModalHoloSpark")],
    window: [part(importHolo, "UiModalHolo")],
    inner: [part(importHolo, "UiModalHoloGlass")],
  },
  "cyber-sakura": {
    spark: [],
    window: [part(importBloom, "UiModalBloom"), part(importBloom, "UiModalBloomCoupling")],
    inner: [part(importBloom, "UiModalBloomVein"), part(importBloom, "UiModalBloomSkin")],
  },
};
