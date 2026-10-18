import { defineComponent, h, type PropType } from "vue";
import { useForm } from "vee-validate";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import FormTextarea from "./FormTextarea.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface TextareaCase {
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

const placeholder = "There is space for your project here";

const cases: TextareaCase[] = [
  { name: "textarea", label: "Message", placeholder },
  {
    name: "textarea-filled",
    label: "Message",
    value: "Hello!\nWe need a landing page and a small online store for a studio.\nDeadline: June.",
  },
  {
    name: "textarea-scroll",
    label: "Message",
    value:
      "Hi! We are launching a small online store for handmade ceramics.\n\nScope: catalog with filters, product pages, cart and checkout.\n\nTimeline: first release in eight weeks, then a blog.\n\nCould you share similar cases and a rough estimate?",
  },
  {
    name: "textarea-error",
    label: "Message",
    placeholder,
    error: "Введите сообщение",
  },
  { name: "textarea-focus", label: "Message", placeholder, focus: true },
  { name: "disabled", label: "Message", placeholder, disabled: true },
  { name: "textarea-disabled", placeholder, bare: "textarea-disabled" },
];

const switchCases: TextareaCase[] = [
  { name: "textarea", label: "Message", placeholder },
  {
    name: "textarea-error",
    label: "Message",
    placeholder,
    error: "Введите сообщение",
  },
];

function renderCase(item: TextareaCase) {
  const field = item.bare
    ? h("textarea", { class: ["textarea", item.bare], placeholder: item.placeholder })
    : h(
        FormHost,
        {
          initialValues: item.value === undefined ? undefined : { field: item.value },
          initialErrors: item.error === undefined ? undefined : { field: item.error },
        },
        () =>
          h(FormTextarea, {
            name: "field",
            label: item.label,
            placeholder: item.placeholder,
            disabled: item.disabled,
          }),
      );

  return render(() => h("div", { class: wrapperClass }, field));
}

beforeAll(async () => {
  await document.fonts.load(
    '1em "Martian Mono"',
    "Введите сообщение There is space for your project here Hello We need a landing page",
  );
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);

    if (item.focus) screen.container.querySelector("textarea")!.focus();

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
