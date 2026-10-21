import { onMounted, ref, watch } from "vue";
import { useMediaQuery, useTimeoutFn } from "@vueuse/core";
import type { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import { skillWaveSwapTime } from "./skillWave";

export const SKILL_SWAP_PERIOD = 32000;

export function useSkillSwap(first: SkillTile, second: SkillTile, phase: number, steps: number) {
  const skill = ref(first);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  let swaps = 0;

  const timer = useTimeoutFn(swap, wait, { immediate: false });

  function time(index: number) {
    return skillWaveSwapTime(phase, steps, SKILL_SWAP_PERIOD, index);
  }

  function wait() {
    return swaps === 0 ? time(0) : time(swaps) - time(swaps - 1);
  }

  function swap() {
    skill.value = skill.value === first ? second : first;
    swaps += 1;
    timer.start();
  }

  function run(reduce: boolean) {
    timer.stop();
    swaps = 0;
    skill.value = first;
    if (!reduce) timer.start();
  }

  onMounted(() => {
    watch(reduced, run, { immediate: true });
  });

  return { skill };
}
