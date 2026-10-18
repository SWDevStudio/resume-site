import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { useForm } from "vee-validate";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import FormCheckbox from "./FormCheckbox.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface CheckboxCase {
  name: string;
  checked?: boolean;
  error?: string;
  disabled?: boolean;
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
const label = "I acknowledge and consent to the storage of my data";
const errorText = "Необходимо подтвердить согласие";

const FormHost = defineComponent({
  props: {
    checked: Boolean,
    error: String,
    disabled: Boolean,
  },
  setup(props) {
    useForm({
      initialValues: { agree: props.checked },
      initialErrors: props.error ? { agree: props.error } : {},
    });

    return () => h(FormCheckbox, { name: "agree", disabled: props.disabled }, () => label);
  },
});

const cases: CheckboxCase[] = [
  { name: "unchecked" },
  { name: "checked", checked: true },
  { name: "error", error: errorText },
  { name: "error-checked", checked: true, error: errorText },
  { name: "disabled", disabled: true },
  { name: "disabled-checked", checked: true, disabled: true },
  { name: "focus", focus: true },
  { name: "focus-checked", checked: true, focus: true },
  { name: "focus-error", error: errorText, focus: true },
];

const nativeCases: NativeCase[] = [
  { name: "native", class: "checkbox" },
  { name: "native-checked", class: "checkbox", checked: true },
  { name: "native-error-checked", class: "checkbox checkbox-error", checked: true },
  { name: "native-disabled-checked", class: "checkbox", checked: true, disabled: true },
  { name: "native-checkbox-disabled", class: "checkbox checkbox-disabled" },
];

const switchCases: CheckboxCase[] = [
  { name: "unchecked" },
  { name: "checked", checked: true },
  { name: "error-checked", checked: true, error: errorText },
];

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"');
  await document.fonts.load('300 1em "Martian Mono"');
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await render(() =>
      h(
        "div",
        { class: wrapper },
        h(FormHost, { checked: item.checked, error: item.error, disabled: item.disabled }),
      ),
    );

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
          type: "checkbox",
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
    const screen = await render(() =>
      h(
        "div",
        { class: wrapper },
        h(FormHost, { checked: item.checked, error: item.error, disabled: item.disabled }),
      ),
    );
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
