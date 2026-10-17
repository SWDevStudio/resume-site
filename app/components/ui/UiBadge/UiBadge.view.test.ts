import { h, type VNodeChild } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import UiBadge from "./UiBadge.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface BadgeCase {
  name: string;
  class?: string;
  slot?: () => VNodeChild;
}

const themes = ["torii-synth", "cyber-sakura"];

const withStatus = (status: string, label: string) => () => [
  h("span", { class: ["status", status] }),
  label,
];

const cases: BadgeCase[] = [
  { name: "badge" },
  { name: "badge-primary", class: "badge-primary" },
  { name: "badge-secondary", class: "badge-secondary" },
  { name: "badge-accent", class: "badge-accent" },
  { name: "badge-ghost", class: "badge-ghost" },
  { name: "status", slot: withStatus("", "IDLE") },
  { name: "status-primary", slot: withStatus("status-primary", "BUSY") },
  { name: "status-secondary", slot: withStatus("status-secondary", "ONLINE") },
  { name: "status-accent", slot: withStatus("status-accent", "AWAY") },
  { name: "status-success", slot: withStatus("status-success", "OPEN TO PROJECTS") },
];

const switchCases: BadgeCase[] = [
  { name: "badge", slot: withStatus("status-secondary", "ONLINE") },
  { name: "badge-primary", class: "badge-primary" },
  { name: "badge-ghost", class: "badge-ghost" },
];

const renderBadge = (item: BadgeCase) =>
  render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-4" },
      h(UiBadge, { class: item.class }, item.slot ?? (() => "Full-Stack")),
    ),
  );

beforeAll(async () => {
  await document.fonts.load('300 1em "Martian Mono"');
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderBadge(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  afterEach(() => {
    for (const animation of document.getAnimations()) animation.finish();
  });

  it.each(switchCases)("$name", async (item) => {
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderBadge(item);
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
