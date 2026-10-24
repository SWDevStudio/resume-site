import { ref } from "vue";

export async function useAsyncData<T>(_key: string, handler: () => Promise<T>) {
  const data = ref<T | null>(null);
  data.value = await handler();
  return { data };
}

export function useHead() {}

export function definePageMeta() {}

export function useState<T>(_key: string, init: () => T) {
  return ref(init());
}

export function useNuxtApp() {
  return { isHydrating: false };
}

export function tryUseNuxtApp(): null {
  return null;
}

export function createError(input: {
  statusCode: number;
  statusMessage?: string;
  fatal?: boolean;
}) {
  return Object.assign(new Error(input.statusMessage ?? String(input.statusCode)), input);
}
