import { defineComponent, h, type PropType } from "vue";
import { useForm } from "vee-validate";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import FormInput from "./FormInput.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface InputCase {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  focus?: boolean;
  bare?: string;
}

const themes = ["torii-synth", "cyber-sakura"];

const FormHost = defineComponent({
  props: {
    initialValues: Object as PropType<Record<string, string>>,
    initialErrors: Object as PropType<Record<string, string>>,
  },
  setup(props, { slots }) {
    useForm({ initialValues: props.initialValues, initialErrors: props.initialErrors });
    return () => slots.default?.();
  },
});

const wrapperClass = "inline-block w-96 bg-base-100 p-4 font-body text-base-content";

const cases: InputCase[] = [
  { name: "input", label: "Name*", placeholder: "John Doe" },
  { name: "input-filled", label: "Name*", value: "John Doe" },
  { name: "input-no-label", placeholder: "name@mail" },
  {
    name: "input-error",
    label: "Email Address*",
    placeholder: "name@mail",
    error: "Введите корректный email",
  },
  { name: "input-focus", label: "Name*", placeholder: "John Doe", focus: true },
  { name: "disabled", label: "Name*", placeholder: "John Doe", disabled: true },
  { name: "input-disabled", placeholder: "John Doe", bare: "input-disabled" },
];

const switchCases: InputCase[] = [
  { name: "input", label: "Name*", placeholder: "John Doe" },
  {
    name: "input-error",
    label: "Email Address*",
    placeholder: "name@mail",
    error: "Введите корректный email",
  },
];

function renderCase(item: InputCase) {
  const field = item.bare
    ? h("input", { class: ["input", item.bare], placeholder: item.placeholder })
    : h(
        FormHost,
        {
          initialValues: item.value === undefined ? undefined : { field: item.value },
          initialErrors: item.error === undefined ? undefined : { field: item.error },
        },
        () =>
          h(FormInput, {
            name: "field",
            label: item.label,
            placeholder: item.placeholder,
            disabled: item.disabled,
          }),
      );

  return render(() => h("div", { class: wrapperClass }, field));
}

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"', "Введите корректный email John Doe");
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);

    if (item.focus) screen.container.querySelector("input")!.focus();

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
