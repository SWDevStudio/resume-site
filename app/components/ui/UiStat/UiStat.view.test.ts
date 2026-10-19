import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import UiStat from "./UiStat.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface StatCase {
  name: string;
  class?: string;
  value: string;
  title: string;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: StatCase[] = [
  { name: "stat", value: "8+", title: "YEARS" },
  { name: "stat-primary", class: "stat-primary", value: "8+", title: "YEARS" },
  { name: "stat-secondary", class: "stat-secondary", value: "95", title: "LIGHTHOUSE" },
  { name: "stat-accent", class: "stat-accent", value: "40", title: "PROJECTS" },
];

const renderStats = () =>
  render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-4 font-body font-light text-base-content" },
      h("div", { class: "stats" }, [
        h(UiStat, { class: "stat-primary" }, { value: () => "8+", default: () => "YEARS" }),
        h(UiStat, { class: "stat-accent" }, { value: () => "40", default: () => "PROJECTS" }),
        h(UiStat, { class: "stat-secondary" }, { value: () => "95", default: () => "LIGHTHOUSE" }),
      ]),
    ),
  );

beforeAll(async () => {
  await document.fonts.load('1em "Righteous"', "8+ 40 95");
  await document.fonts.load('300 1em "Martian Mono"', "YEARS PROJECTS LIGHTHOUSE");
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await render(() =>
      h(
        "div",
        { class: "inline-block bg-base-100 p-4 font-body font-light text-base-content" },
        h(UiStat, { class: item.class }, { value: () => item.value, default: () => item.title }),
      ),
    );

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });

  it("stats", async () => {
    const screen = await renderStats();

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-stats`);
  });
});

describe("theme switch", () => {
  afterEach(() => {
    for (const animation of document.getAnimations()) animation.finish();
  });

  it("stats", async () => {
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderStats();
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
      .toMatchScreenshot("switch-stats", { screenshotOptions: { animations: "allow" } });
  });
});
