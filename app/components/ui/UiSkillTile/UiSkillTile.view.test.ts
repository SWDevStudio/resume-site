import { h, nextTick, ref, type Ref } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import UiSkillTile from "./UiSkillTile.vue";
import { SkillTile } from "./skillTile";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface SkillTileCase {
  name: string;
  skill: SkillTile;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: SkillTileCase[] = Object.values(SkillTile).map((skill) => ({
  name: skill,
  skill,
}));

const switchCases: SkillTileCase[] = [
  { name: SkillTile.React, skill: SkillTile.React },
  { name: SkillTile.NextJs, skill: SkillTile.NextJs },
  { name: SkillTile.TypeScript, skill: SkillTile.TypeScript },
];

const changeCases: SkillTileCase[] = [
  { name: "react-to-vue", skill: SkillTile.Vue },
  { name: "react-to-typescript", skill: SkillTile.TypeScript },
];

const renderTile = (skill: Ref<SkillTile>) =>
  render(() =>
    h("div", { class: "inline-block bg-base-100 p-4" }, h(UiSkillTile, { skillName: skill.value })),
  );

beforeAll(async () => {
  await document.fonts.load('400 1em "Martian Mono"');
});

describe("text skills", () => {
  it("renders a skill without an icon inside the same tile frame", async () => {
    const screen = await render(() => h(UiSkillTile, { label: "REST API" }));

    expect(screen.container.querySelector(".skill-tile-frame")).not.toBeNull();
    expect(screen.container.querySelector(".skill-tile-deco")).not.toBeNull();
    expect(screen.container.querySelector(".skill-tile-text")?.textContent?.trim()).toBe(
      "REST API",
    );
    expect(screen.container.querySelector("img")).toBeNull();
  });

  it("animates a translated text skill and removes the previous layer", async () => {
    const label = ref("Team management");
    const screen = await render(() => h(UiSkillTile, { label: label.value }));

    label.value = "Team leadership";
    await nextTick();

    expect(screen.container.querySelector(".skill-tile-leave")?.textContent?.trim()).toBe(
      "Team management",
    );
    expect(screen.container.querySelector(".skill-tile-enter")?.textContent?.trim()).toBe(
      "Team leadership",
    );
    for (const animation of document.getAnimations()) animation.finish();
    await expect.poll(() => screen.container.querySelectorAll(".skill-tile-layer").length).toBe(1);
    expect(screen.container.querySelector(".skill-tile-label")?.textContent).toBe(
      "Team leadership",
    );
  });
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderTile(ref(item.skill));

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe.each(themes)("skill change %s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  afterEach(() => {
    for (const animation of document.getAnimations()) animation.finish();
  });

  it("does not animate on first render", async () => {
    const screen = await renderTile(ref(SkillTile.React));

    expect(screen.container.querySelectorAll(".skill-tile-layer")).toHaveLength(1);
    expect(screen.container.querySelector(".skill-tile-fx")).toBeNull();
    expect(document.getAnimations().filter((item) => item instanceof CSSAnimation)).toHaveLength(0);
  });

  it("plays the swap when skillName changes and drops the old layer afterwards", async () => {
    const skill = ref(SkillTile.React);
    const screen = await renderTile(skill);
    skill.value = SkillTile.Vue;
    await nextTick();

    expect(screen.container.querySelectorAll(".skill-tile-layer")).toHaveLength(2);
    expect(screen.container.querySelectorAll(".skill-tile-leave")).toHaveLength(1);
    expect(screen.container.querySelectorAll(".skill-tile-enter")).toHaveLength(1);
    expect(screen.container.querySelector(".skill-tile-fx")).not.toBeNull();
    expect(document.getAnimations().length).toBeGreaterThan(0);

    for (const animation of document.getAnimations()) animation.finish();

    await expect.poll(() => screen.container.querySelectorAll(".skill-tile-layer").length).toBe(1);
    expect(screen.container.querySelector(".skill-tile-label")?.textContent).toBe("Vue");
    expect(screen.container.querySelector(".skill-tile-fx")).toBeNull();
  });

  it.each(changeCases)("mid swap $name", async (item) => {
    const skill = ref(SkillTile.React);
    const screen = await renderTile(skill);
    skill.value = item.skill;
    await nextTick();

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-swap-${item.name}`, {
        screenshotOptions: { animations: "allow" },
      });
  });
});

describe("theme switch", () => {
  afterEach(() => {
    for (const animation of document.getAnimations()) animation.finish();
  });

  it.each(switchCases)("$name", async (item) => {
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderTile(ref(item.skill));
    screen.container.getBoundingClientRect();
    document.documentElement.dataset.theme = "cyber-sakura";

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`switch-${item.name}`, { screenshotOptions: { animations: "allow" } });
  });
});
