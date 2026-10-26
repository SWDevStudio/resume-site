import {
  defineAsyncComponent,
  defineComponent,
  h,
  mergeProps,
  ref,
  type AsyncComponentLoader,
  type Ref,
} from "vue";

const states = new Map<string, Ref<unknown>>();

export async function useAsyncData<T>(_key: string, handler: () => Promise<T>) {
  const data = ref<T | null>(null);
  data.value = await handler();
  return { data };
}

export function useHead() {}

export function useSeoMeta() {}

export function definePageMeta() {}

export function useState<T>(key: string, init: () => T) {
  if (!states.has(key)) states.set(key, ref(init()));
  return states.get(key) as Ref<T>;
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

const hydrationProps = [
  "hydrateOnVisible",
  "hydrateOnIdle",
  "hydrateOnInteraction",
  "hydrateOnMediaQuery",
  "hydrateAfter",
  "hydrateWhen",
  "hydrateNever",
];

export function defineLazyHydrationComponent(_strategy: string, loader: AsyncComponentLoader) {
  const child = defineAsyncComponent(loader);
  return defineComponent({
    inheritAttrs: false,
    props: hydrationProps,
    emits: ["hydrated"],
    setup(_, { attrs, slots, emit }) {
      const onVnodeMounted = () => emit("hydrated");
      return () => h(child, mergeProps(attrs, { onVnodeMounted }), slots);
    },
  });
}
