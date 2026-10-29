import { computed, onMounted, watch } from "vue";
import { useEventListener, useIntersectionObserver, useWindowSize } from "@vueuse/core";
import type { SectionsRegistry } from "./usePageSections";

const TOLERANCE = 4;
const READING_LINE = 0.3;

export function usePageSectionsSpy(registry: SectionsRegistry) {
  const { width, height } = useWindowSize();
  let line = 0;

  const targets = computed(() =>
    registry.entries.value
      .map((entry) => entry.element)
      .filter((element): element is HTMLElement => element !== null),
  );

  function measure() {
    const element = targets.value[0];
    const heading = element?.querySelector<HTMLElement>(".page-section-heading") ?? element;
    if (!heading) return;
    const offset = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
    line = Math.round(Math.max(offset + TOLERANCE, height.value * READING_LINE));
  }

  function settle() {
    registry.settle(line, TOLERANCE);
  }

  function update() {
    measure();
    settle();
  }

  useEventListener("scroll", settle, { passive: true });

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
      settle();
    },
    { threshold: [1] },
  );

  watch([width, height, targets], update, { flush: "post" });
  onMounted(() => {
    registry.mounted.value = true;
    update();
  });
}
