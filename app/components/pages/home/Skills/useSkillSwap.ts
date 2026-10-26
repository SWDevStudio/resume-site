import { computed, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import { useMediaQuery, useTimeoutFn } from "@vueuse/core";
import type { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import { skillWaveSwapTime } from "./skillWave";

export const SKILL_SWAP_PERIOD = 32000;

export function useSkillSwap(
  first: SkillTile,
  second: SkillTile,
  phase: number,
  steps: number,
  paused: MaybeRefOrGetter<boolean> = false,
) {
  const skill = ref(first);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = computed(() => !reduced.value && !toValue(paused));
  let swaps = 0;
  let elapsed = 0;
  let resumedAt = 0;

  const timer = useTimeoutFn(swap, wait, { immediate: false });

  function time(index: number) {
    return skillWaveSwapTime(phase, steps, SKILL_SWAP_PERIOD, index);
  }

  function wait() {
    return Math.max(0, time(swaps) - elapsed);
  }

  function swap() {
    skill.value = skill.value === first ? second : first;
    elapsed = time(swaps);
    resumedAt = performance.now();
    swaps += 1;
    timer.start();
  }

  function resume() {
    if (timer.isPending.value) return;
    resumedAt = performance.now();
    timer.start();
  }

  function pause() {
    if (!timer.isPending.value) return;
    timer.stop();
    elapsed += performance.now() - resumedAt;
  }

  function sync() {
    if (active.value) resume();
    else pause();
  }

  function reset() {
    timer.stop();
    swaps = 0;
    elapsed = 0;
    skill.value = first;
    sync();
  }

  onMounted(() => {
    watch(reduced, reset);
    watch(active, sync, { immediate: true });
  });

  return { skill };
}
