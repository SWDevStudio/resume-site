import { describe, expect, it } from "vitest";
import { buildSkillGroups } from "#shared/mock/build";
import { staticSources } from "#shared/mock/sources.static";
import { buildSkillPanels } from "./skillPanels";
import { skillWaveOrder, skillWavePhases, skillWaveSwapTime } from "./skillWave";
import { SKILL_SWAP_PERIOD } from "./useSkillSwap";

const { panels: skillPanels, steps: skillWaveSteps } = buildSkillPanels(
  buildSkillGroups(staticSources("en"), "en"),
);

const sizes = skillPanels.map((panel) => panel.tiles.length);

function names() {
  return skillWaveOrder(sizes).map(({ panel, tile }) => `${panel}:${tile}`);
}

describe("skill panels", () => {
  it("have the same number of tiles with the same layout", () => {
    const [frontend, backend] = skillPanels;

    expect(frontend!.tiles).toHaveLength(9);
    expect(backend!.tiles).toHaveLength(frontend!.tiles.length);
    expect(backend!.tiles.map((tile) => tile.class)).toEqual(
      frontend!.tiles.map((tile) => tile.class),
    );
    expect(backend!.tiles.filter((tile) => tile.class === "home-skills-tile-wide")).toHaveLength(3);
    expect(skillWaveSteps).toBe(18);
  });

  it("never repeat a skill", () => {
    const all = skillPanels.flatMap((panel) =>
      panel.tiles.flatMap((tile) => [tile.skill, tile.swap]),
    );

    expect(new Set(all).size).toBe(all.length);
  });
});

describe("skillWaveOrder", () => {
  it("goes through every second tile, frontend 1, backend 2, frontend 3, and so on", () => {
    const order = skillWaveOrder(sizes);

    expect(order.slice(0, 9)).toEqual(
      Array.from({ length: 9 }, (_, tile) => ({ panel: tile % 2, tile })),
    );
  });

  it("then goes through the rest the other way round, backend 1, frontend 2, backend 3", () => {
    const order = skillWaveOrder(sizes);

    expect(order.slice(9)).toEqual(
      Array.from({ length: 9 }, (_, tile) => ({ panel: 1 - (tile % 2), tile })),
    );
    expect(names().slice(0, 4)).toEqual(["0:0", "1:1", "0:2", "1:3"]);
    expect(names().slice(9, 13)).toEqual(["1:0", "0:1", "1:2", "0:3"]);
  });

  it("visits every tile once", () => {
    expect(names()).toHaveLength(18);
    expect(new Set(names()).size).toBe(18);
  });

  it("handles panels of different length", () => {
    expect(skillWaveOrder([3, 1])).toEqual([
      { panel: 0, tile: 0 },
      { panel: 0, tile: 2 },
      { panel: 1, tile: 0 },
      { panel: 0, tile: 1 },
    ]);
  });
});

describe("skillWavePhases", () => {
  it("gives every tile its own place in the walk", () => {
    const phases = skillWavePhases(sizes).flat();

    expect([...phases].sort((a, b) => a - b)).toEqual(Array.from({ length: 18 }, (_, i) => i));
  });

  it("grows along the walk", () => {
    const phases = skillWavePhases(sizes);
    const along = skillWaveOrder(sizes).map(({ panel, tile }) => phases[panel]![tile]!);

    expect(along).toEqual(Array.from({ length: 18 }, (_, i) => i));
  });

  it("is what the panels carry", () => {
    const phases = skillWavePhases(sizes);

    skillPanels.forEach((panel, panelIndex) => {
      panel.tiles.forEach((tile, tileIndex) => {
        expect(tile.phase).toBe(phases[panelIndex]![tileIndex]);
      });
    });
  });
});

describe("skillWaveSwapTime", () => {
  const step = SKILL_SWAP_PERIOD / skillWaveSteps;
  const time = (phase: number, swap: number) =>
    skillWaveSwapTime(phase, skillWaveSteps, SKILL_SWAP_PERIOD, swap);

  it("swaps the tiles one after another at an equal step", () => {
    const times = skillPanels
      .flatMap((panel) => panel.tiles)
      .map((tile) => time(tile.phase, 0))
      .sort((a, b) => a - b);

    expect(new Set(times).size).toBe(18);
    expect(times[0]).toBe(Math.round(step));
    expect(times.at(-1)).toBe(SKILL_SWAP_PERIOD);
    for (let index = 1; index < times.length; index += 1) {
      expect(Math.abs(times[index]! - times[index - 1]! - step)).toBeLessThanOrEqual(1);
    }
  });

  it("swaps each tile exactly once per period", () => {
    for (const tile of skillPanels.flatMap((panel) => panel.tiles)) {
      for (let swap = 1; swap < 6; swap += 1) {
        expect(time(tile.phase, swap) - time(tile.phase, swap - 1)).toBe(SKILL_SWAP_PERIOD);
      }
    }
  });
});
