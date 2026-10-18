import { defineComponent, h } from "vue";
import { useForm } from "vee-validate";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import FormToggle from "./FormToggle.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface ToggleCase {
  name: string;
  label?: string;
  checked?: boolean;
  error?: string;
  disabled?: boolean;
  focus?: boolean;
  bare?: string;
}

const themes = ["torii-synth", "cyber-sakura"];

const Host = defineComponent({
  props: {
    label: { type: String, required: true },
    checked: Boolean,
    error: String,
    disabled: Boolean,
  },
  setup(props) {
    useForm({
      initialValues: { agree: props.checked },
      initialErrors: props.error ? { agree: props.error } : {},
    });
    return () => h(FormToggle, { name: "agree", disabled: props.disabled }, () => props.label);
  },
});

const cases: ToggleCase[] = [
  { name: "toggle", label: "Reduce motion" },
  { name: "toggle-checked", label: "Torii Synth / Cyber Sakura", checked: true },
  { name: "toggle-error", label: "I agree to the terms", error: "Consent is required" },
  { name: "toggle-error-checked", label: "I agree to the terms", checked: true, error: "Error" },
  { name: "disabled", label: "Reduce motion", disabled: true },
  { name: "disabled-checked", label: "Reduce motion", checked: true, disabled: true },
  { name: "focus", label: "Reduce motion", focus: true },
  { name: "focus-checked", label: "Reduce motion", checked: true, focus: true },
  { name: "toggle-disabled", bare: "toggle toggle-disabled", checked: true },
  { name: "bare-checked", bare: "toggle", checked: true },
];

const switchCases: ToggleCase[] = [
  { name: "toggle", label: "Reduce motion" },
  { name: "toggle-checked", label: "Torii Synth / Cyber Sakura", checked: true },
  { name: "toggle-error", label: "I agree to the terms", error: "Consent is required" },
  { name: "focus-checked", label: "Reduce motion", checked: true, focus: true },
];

const renderCase = (item: ToggleCase) =>
  render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-4 font-body text-base-content" },
      item.bare
        ? h("input", {
            type: "checkbox",
            role: "switch",
            class: item.bare,
            checked: item.checked,
            disabled: item.disabled,
          })
        : h(Host, {
            label: item.label!,
            checked: item.checked,
            error: item.error,
            disabled: item.disabled,
          }),
    ),
  );

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"');
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);
    if (item.focus) await userEvent.tab();

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
    const screen = await renderCase(item);
    if (item.focus) await userEvent.tab();
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
