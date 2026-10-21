export interface SkillWaveSlot {
  panel: number;
  tile: number;
}

export function skillWaveOrder(sizes: number[]): SkillWaveSlot[] {
  const longest = Math.max(...sizes);
  const order: SkillWaveSlot[] = [];

  for (const parity of [0, 1]) {
    for (let tile = 0; tile < longest; tile += 1) {
      for (let panel = 0; panel < sizes.length; panel += 1) {
        if (tile < sizes[panel]! && (panel + tile) % 2 === parity) order.push({ panel, tile });
      }
    }
  }

  return order;
}

export function skillWavePhases(sizes: number[]): number[][] {
  const phases = sizes.map((size) => Array.from({ length: size }, () => 0));

  skillWaveOrder(sizes).forEach(({ panel, tile }, index) => {
    phases[panel]![tile] = index;
  });

  return phases;
}

export function skillWaveSwapTime(phase: number, steps: number, period: number, swap: number) {
  return Math.round(((swap * steps + phase + 1) * period) / steps);
}
