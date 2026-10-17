import { h, type VNodeChild } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import UiButton from "./UiButton.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface ButtonCase {
  name: string;
  class?: string;
  disabled?: boolean;
  wrapper?: string;
  slot?: () => VNodeChild;
}

const themes = ["torii-synth", "cyber-sakura"];

const githubIcon = () =>
  h(
    "svg",
    {
      class: "size-5.5",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
    },
    h("path", {
      d: "M4 9V20M4 4.5V5M9 20V9M9 13.5C9 11 10.5 9 13 9C15.5 9 16 11 16 13V20M20 20V13",
    }),
  );

const cases: ButtonCase[] = [
  { name: "btn" },
  { name: "btn-primary", class: "btn-primary" },
  { name: "btn-secondary", class: "btn-secondary" },
  { name: "btn-accent", class: "btn-accent" },
  { name: "btn-xs", class: "btn-xs" },
  { name: "btn-sm", class: "btn-sm" },
  { name: "btn-md", class: "btn-md" },
  { name: "btn-lg", class: "btn-lg" },
  { name: "btn-xl", class: "btn-xl" },
  { name: "disabled", disabled: true },
  { name: "btn-disabled", class: "btn-primary btn-disabled" },
  { name: "btn-ghost", class: "btn-ghost" },
  { name: "btn-link", class: "btn-link" },
  { name: "btn-square", class: "btn-square", slot: githubIcon },
  { name: "btn-block", class: "btn-primary btn-block", wrapper: "w-96" },
  { name: "btn-gradient", class: "btn-gradient btn-block", wrapper: "w-96" },
];

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"');
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await render(() =>
      h(
        "div",
        { class: ["inline-block bg-base-100 p-4", item.wrapper] },
        h(
          UiButton,
          { class: item.class, disabled: item.disabled },
          item.slot ?? (() => "Projects"),
        ),
      ),
    );

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});
