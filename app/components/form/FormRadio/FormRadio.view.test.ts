import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { useForm } from "vee-validate";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import FormRadio from "./FormRadio.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface RadioCase {
  name: string;
  value?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  optionDisabled?: boolean;
  focus?: boolean;
}

interface NativeCase {
  name: string;
  class: string;
  checked?: boolean;
  disabled?: boolean;
}

const themes = ["torii-synth", "cyber-sakura"];

const wrapper = "inline-block bg-base-100 p-4 font-body text-base-content";
const groupLabel = "Тип проекта";
const errorText = "Выберите тип проекта";

const FormHost = defineComponent({
  props: {
    value: String,
    label: String,
    error: String,
    disabled: Boolean,
    optionDisabled: Boolean,
  },
  setup(props) {
    useForm({
      initialValues: { projectType: props.value },
      initialErrors: props.error ? { projectType: props.error } : {},
    });

    return () =>
      h(FormRadio, {
        name: "projectType",
        label: props.label,
        disabled: props.disabled,
        options: [
          { value: "landing", label: "Landing page" },
          { value: "store", label: "Online store", disabled: props.optionDisabled },
        ],
      });
  },
});

const cases: RadioCase[] = [
  { name: "empty" },
  { name: "selected", value: "landing" },
  { name: "selected-second", value: "store" },
  { name: "label", label: groupLabel },
  { name: "error", error: errorText },
  { name: "error-selected", value: "landing", error: errorText },
  { name: "label-error-selected", value: "store", label: groupLabel, error: errorText },
  { name: "focus", focus: true },
  { name: "focus-selected", value: "store", focus: true },
  { name: "focus-error", error: errorText, focus: true },
  { name: "disabled", disabled: true },
  { name: "disabled-selected", value: "landing", disabled: true },
  { name: "disabled-option", value: "landing", optionDisabled: true },
];

const nativeCases: NativeCase[] = [
  { name: "native", class: "radio" },
  { name: "native-checked", class: "radio", checked: true },
  { name: "native-error-checked", class: "radio radio-error", checked: true },
  { name: "native-disabled-checked", class: "radio", checked: true, disabled: true },
  { name: "native-radio-disabled", class: "radio radio-disabled" },
];

const switchCases: RadioCase[] = [
  { name: "empty" },
  { name: "selected", value: "landing" },
  { name: "error-selected", value: "landing", error: errorText },
];

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"');
  await document.fonts.load('300 1em "Martian Mono"');
});

function hostProps(item: RadioCase) {
  return {
    value: item.value,
    label: item.label,
    error: item.error,
    disabled: item.disabled,
    optionDisabled: item.optionDisabled,
  };
}

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await render(() => h("div", { class: wrapper }, h(FormHost, hostProps(item))));

    if (item.focus) await userEvent.tab();

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });

  it.each(nativeCases)("$name", async (item) => {
    const screen = await render(() =>
      h(
        "div",
        { class: "inline-flex bg-base-100 p-4" },
        h("input", {
          type: "radio",
          class: item.class,
          checked: item.checked,
          disabled: item.disabled,
        }),
      ),
    );

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
    const screen = await render(() => h("div", { class: wrapper }, h(FormHost, hostProps(item))));
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
