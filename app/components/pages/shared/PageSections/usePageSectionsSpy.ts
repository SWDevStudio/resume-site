import { computed, onMounted, ref, watch } from "vue";
import { useIntersectionObserver, useWindowSize } from "@vueuse/core";
import type { SectionsRegistry } from "./usePageSections";

const TOLERANCE = 4;
const BAND = 2;

export function usePageSectionsSpy(registry: SectionsRegistry) {
  const { width, height } = useWindowSize();
  const line = ref(0);

  const targets = computed(() =>
    registry.entries.value
      .map((entry) => entry.element)
      .filter((element): element is HTMLElement => element !== null),
  );

  const rootMargin = computed(() => {
    const bottom = Math.max(0, height.value - line.value - BAND);
    return `-${line.value}px 0px -${bottom}px 0px`;
  });

  function measure() {
    const heading = targets.value[0]?.querySelector<HTMLElement>(".page-section-heading");
    if (!heading) return;
    const offset = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
    line.value = Math.round(offset + TOLERANCE);
  }

  useIntersectionObserver(targets, () => registry.settle(line.value + BAND), { rootMargin });

  const last = computed(() => {
    const element = registry.entries.value.at(-1)?.element;
    return element ? [element] : [];
  });

  useIntersectionObserver(
    last,
    (records) => {
      const record = records.at(-1);
      registry.setEnd(
        record !== undefined && record.isIntersecting && record.intersectionRatio >= 1,
      );
      registry.settle(line.value + BAND);
    },
    { threshold: [1] },
  );

  watch([width, targets], measure, { flush: "post" });
  onMounted(() => {
    registry.mounted.value = true;
    measure();
  });
}
