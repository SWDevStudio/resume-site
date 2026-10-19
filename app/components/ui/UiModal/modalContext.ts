import type { InjectionKey, Ref } from "vue";

export const MODAL_MODULE_KEY: InjectionKey<Readonly<Ref<string>>> = Symbol("modal-module");
