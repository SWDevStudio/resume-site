import { h, nextTick, ref, type Ref, type VNodeChild } from "vue";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import FormCheckbox from "~/components/form/FormCheckbox/FormCheckbox.vue";
import FormInput from "~/components/form/FormInput/FormInput.vue";
import FormTextarea from "~/components/form/FormTextarea/FormTextarea.vue";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiModal from "./UiModal.vue";
import { importBloom, importHolo, importWindow } from "./modalImports";
import { resetModalWindowLoader } from "./modalLoader";
import { setTheme } from "../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../test/mocks/useTheme"));
vi.mock("./modalImports", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./modalImports")>();
  return { ...actual, importWindow: vi.fn(() => actual.importWindow()) };
});

interface ModalCase {
  name: string;
  width: number;
  height: number;
}

interface ModalProps {
  label?: string;
  title?: string;
  accent?: string;
  description?: string;
  closeLabel?: string;
  module?: string;
}

interface Mounted {
  screen: Awaited<ReturnType<typeof render>>;
  model: Ref<boolean>;
  instance: Ref<{
    open: () => void;
    close: () => void;
  } | null>;
  dialog: () => HTMLDialogElement;
  trigger: () => HTMLElement;
  slotProps: {
    open?: () => void;
    close?: () => void;
    isOpen?: boolean;
  };
  events: string[];
  snapshots: {
    name: string;
    open: boolean;
    state: string | undefined;
  }[];
}

interface MountOptions {
  props?: ModalProps;
  width?: number;
  height?: number;
  tall?: boolean;
  lang?: string;
  startOpen?: boolean;
  warm?: boolean;
  ancestor?: {
    style?: string;
    attrs?: Record<string, string>;
  };
  content?: () => VNodeChild;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: ModalCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 780 },
];

const switchCases: ModalCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 780 },
];

const baseProps: Required<ModalProps> = {
  label: "05 — CONTACT",
  title: "Let's grow",
  accent: "together",
  description: "Have a project in mind? Write to me — I usually reply within a day.",
  closeLabel: "Close",
  module: "contact",
};

const form = () =>
  h("form", { class: "flex flex-col gap-4", novalidate: true }, [
    h(FormInput, { name: "name", label: "Name*", placeholder: "John Doe" }),
    h(FormInput, { name: "email", label: "Email Address*", placeholder: "example@email.com" }),
    h(FormTextarea, {
      name: "message",
      label: "Message",
      placeholder: "There is space for your project here",
    }),
    h(
      FormCheckbox,
      { name: "consent" },
      () => "I acknowledge and consent to the storage of my data",
    ),
    h(UiButton, { type: "button", class: "w-full" }, () => "SEND MESSAGE"),
  ]);

const longContent = () =>
  h("div", { class: "h-300 rounded-box bg-primary/20 p-4" }, "Long content");

const pageStub = (tall: boolean) => [
  h(
    "header",
    {
      class: "fixed inset-x-0 top-0 z-50 bg-base-100/85 p-4 backdrop-blur-md",
      "data-test": "header",
    },
    "Header",
  ),
  h("main", { class: ["flex flex-col gap-6 p-10 pt-24", tall ? "h-[3000px]" : "h-screen"] }, [
    h("h1", { class: "font-head text-7xl" }, "Fullstack Developer"),
    h("p", { class: "max-w-xl" }, "Background page that stays behind the overlay."),
    h("div", { class: "h-40 rounded-box bg-secondary/40" }),
    h("div", { class: "h-40 rounded-box bg-accent/40" }),
  ]),
];

function dialogAnimations(dialog: Element) {
  return document.getAnimations().filter((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    return target && dialog.contains(target);
  });
}

function cssAnimations(dialog: Element) {
  return dialogAnimations(dialog).filter(
    (animation): animation is CSSAnimation => animation instanceof CSSAnimation,
  );
}

function animationNames(dialog: Element) {
  return cssAnimations(dialog).map((animation) => animation.animationName);
}

function durationOf(dialog: Element, name: string) {
  const animation = cssAnimations(dialog).find((item) => item.animationName === name);
  return animation && Number(animation.effect?.getComputedTiming().duration);
}

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
}

function pauseAt(time: number) {
  const animations = document.getAnimations();
  for (const animation of animations) {
    animation.pause();
    animation.currentTime = Math.min(time, Number(animation.effect?.getComputedTiming().endTime));
  }
  return animations;
}

function transitioning(element: Element, property: string, pseudo: string | null = null) {
  return document.getAnimations().some((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === property &&
      effect?.target === element &&
      effect.pseudoElement === pseudo
    );
  });
}

let motion: "reduce" | "no-preference" = "no-preference";

async function setReducedMotion(value: "reduce" | "no-preference") {
  motion = value;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

async function mountModal(options: MountOptions = {}): Promise<Mounted> {
  await page.viewport(options.width ?? 1440, options.height ?? 900);
  document.documentElement.lang = options.lang ?? "en";
  const model = ref(Boolean(options.startOpen));
  const instance = ref<{
    open: () => void;
    close: () => void;
  } | null>(null);
  const slotProps: Mounted["slotProps"] = {};
  const events: string[] = [];
  const snapshots: Mounted["snapshots"] = [];
  const record = (name: string) => {
    const dialog = document.querySelector<HTMLDialogElement>("dialog.modal");
    events.push(name);
    snapshots.push({ name, open: Boolean(dialog?.open), state: dialog?.dataset.state });
  };
  const props = { ...baseProps, ...options.props };
  const screen = await render(() =>
    h(
      "div",
      {
        ...options.ancestor?.attrs,
        class: ["ancestor bg-base-100 font-body text-base-content", options.ancestor?.attrs?.class],
        style: options.ancestor?.style,
      },
      [
        ...pageStub(Boolean(options.tall)),
        h(
          UiModal,
          {
            ...props,
            ref: instance,
            onOpen: () => record("open"),
            onClose: () => record("close"),
            modelValue: model.value,
            "onUpdate:modelValue": (value: boolean) => {
              model.value = value;
            },
          },
          {
            trigger: (scope: { open: () => void; close: () => void; isOpen: boolean }) => {
              Object.assign(slotProps, scope);
              return h(
                UiButton,
                {
                  class: "fixed bottom-4 left-4 z-10",
                  "data-test": "trigger",
                  onClick: scope.open,
                },
                () => "Open",
              );
            },
            default: options.content ?? form,
          },
        ),
      ],
    ),
  );
  screen.container.getBoundingClientRect();
  const mounted: Mounted = {
    screen,
    model,
    instance,
    slotProps,
    events,
    snapshots,
    dialog: () => document.querySelector<HTMLDialogElement>("dialog.modal")!,
    trigger: () => screen.container.querySelector<HTMLElement>("[data-test='trigger']")!,
  };
  if (options.warm ?? !options.startOpen) await warmUp(mounted);
  return mounted;
}

async function warmUp(mounted: Mounted) {
  const previous = motion;
  await setReducedMotion("reduce");
  const state = () => document.querySelector<HTMLDialogElement>("dialog.modal")?.dataset.state;
  mounted.instance.value!.open();
  await expect.poll(state, { timeout: 15000 }).toBe("open");
  mounted.instance.value!.close();
  await expect.poll(state).toBe("closed");
  await setReducedMotion(previous);
  mounted.events.length = 0;
  mounted.snapshots.length = 0;
}

async function openModal(mounted: Mounted) {
  await userEvent.click(page.elementLocator(mounted.trigger()));
  await expect.poll(() => mounted.dialog().open).toBe(true);
  finishAnimations();
  await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
}

async function closeModal(mounted: Mounted) {
  await userEvent.click(page.elementLocator(mounted.dialog().querySelector(".modal-close")!));
  await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
  finishAnimations();
  await expect.poll(() => mounted.dialog().open).toBe(false);
}

async function whileLoading(run: () => Promise<void>) {
  Object.defineProperty(document, "readyState", { configurable: true, get: () => "loading" });
  try {
    await run();
  } finally {
    Reflect.deleteProperty(document, "readyState");
  }
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function viewportWidth(mounted: Mounted) {
  return mounted.dialog().getBoundingClientRect().width;
}

function box(mounted: Mounted, selector: string) {
  return mounted.dialog().querySelector(selector)!.getBoundingClientRect();
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Let's grow together");
  await document.fonts.load('300 1em "Martian Mono"', "05 — CONTACT Name* Email Address*");
  await document.fonts.load('400 1em "Martian Mono"', "SEND MESSAGE");
  await document.fonts.load('400 1em "Share Tech Mono"', "SYS://CONTACT.MODULE HOLO-LINK");
  await document.fonts.load('400 1em "Montserrat Alternates"', "Давайте расти вместе");
});

beforeEach(async () => {
  resetModalWindowLoader();
  const actual = await vi.importActual<typeof import("./modalImports")>("./modalImports");
  vi.mocked(importWindow).mockReset();
  vi.mocked(importWindow).mockImplementation(() => actual.importWindow());
  setTheme("torii-synth");
});

afterEach(async () => {
  finishAnimations();
  await setReducedMotion("no-preference");
  document.documentElement.lang = "en";
  await page.viewport(1440, 900);
});

const resourceNames = () => performance.getEntriesByType("resource").map((entry) => entry.name);
const mediaImages = () =>
  resourceNames().filter((name) => name.includes("/UiModal/media/") && !name.includes("?import"));
const requested = (part: string) => resourceNames().filter((name) => name.includes(part));
const anyMedia = () => resourceNames().filter((name) => name.includes("/UiModal/media/"));

describe("lazy resources", () => {
  beforeAll(() => {
    performance.setResourceTimingBufferSize(5000);
    performance.clearResourceTimings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads nothing of the window or the decor before the first use, even after the page has loaded and an idle moment", async () => {
    setTheme("torii-synth");
    const idle: (() => void)[] = [];
    vi.spyOn(window, "requestIdleCallback").mockImplementation((callback) => {
      idle.push(() => callback({ didTimeout: false, timeRemaining: () => 50 }));
      return idle.length;
    });
    await mountModal({ warm: false });
    window.dispatchEvent(new Event("load"));
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(idle).toStrictEqual([]);
    expect(requested("UiModalWindow")).toStrictEqual([]);
    expect(requested("UiModalHolo")).toStrictEqual([]);
    expect(requested("UiModalBloom")).toStrictEqual([]);
    expect(anyMedia()).toStrictEqual([]);
    expect(document.querySelector("dialog.modal")).toBeNull();
    vi.restoreAllMocks();
  });

  it("loads only the window and the chunk of the active theme when the trigger is hovered, and no images", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal({ warm: false });

    await userEvent.hover(page.elementLocator(mounted.trigger()));
    await expect
      .poll(() => requested("UiModalWindow").length, { timeout: 15000 })
      .toBeGreaterThan(0);
    await expect.poll(() => requested("UiModalHolo").length).toBeGreaterThan(0);

    expect(requested("UiModalBloom")).toStrictEqual([]);
    expect(requested("cyber-sakura")).toStrictEqual([]);
    expect(mediaImages()).toStrictEqual([]);
    expect(document.querySelector("dialog.modal")).toBeNull();
  });

  it("loads the images of the active theme on the first opening and nothing of the other theme", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal({ warm: false });
    await openModal(mounted);
    await expect.poll(() => mediaImages().length).toBeGreaterThan(0);

    expect(mediaImages().every((name) => name.includes("torii-synth"))).toBe(true);
    expect(requested("cyber-sakura")).toStrictEqual([]);
    expect(requested("UiModalBloom")).toStrictEqual([]);
    expect(anyMedia().filter((name) => name.includes("cyber-sakura"))).toStrictEqual([]);
  });

  it("loads the chunk and the images of the new theme only when the theme becomes active", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal({ warm: false });
    await openModal(mounted);
    expect(requested("UiModalBloom")).toStrictEqual([]);

    setTheme("cyber-sakura");
    await expect
      .poll(() => requested("UiModalBloom").length, { timeout: 15000 })
      .toBeGreaterThan(0);
    await expect
      .poll(() => mediaImages().filter((name) => name.includes("cyber-sakura")).length)
      .toBeGreaterThan(0);
    expect(mounted.dialog().querySelector(".modal-bloom")).not.toBeNull();
  });
});

describe("lazy window", () => {
  const actualImport = async () => {
    const actual = await vi.importActual<typeof import("./modalImports")>("./modalImports");
    return actual.importWindow();
  };

  beforeEach(async () => {
    await page.elementLocator(document.body).hover({ position: { x: 700, y: 100 } });
    resetModalWindowLoader();
    vi.mocked(importWindow).mockReset();
    vi.mocked(importWindow).mockImplementation(actualImport);
    vi.spyOn(window, "requestIdleCallback").mockImplementation(() => 1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetModalWindowLoader();
  });

  function held() {
    let release = () => {};
    vi.mocked(importWindow).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve(actualImport());
        }),
    );
    return { release: () => release() };
  }

  const dialogNow = () => document.querySelector<HTMLDialogElement>("dialog.modal");

  it("does not pull the window while the shell is mounted and idle", async () => {
    const callbacks: (() => void)[] = [];
    vi.spyOn(window, "requestIdleCallback").mockImplementation((callback) => {
      callbacks.push(() => callback({ didTimeout: false, timeRemaining: () => 50 }));
      return callbacks.length;
    });
    const mounted = await mountModal({ warm: false });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(importWindow).not.toHaveBeenCalled();
    expect(dialogNow()).toBeNull();
    expect(mounted.trigger()).not.toBeNull();
  });

  it("renders the trigger at once and keeps the layout of its parent", async () => {
    held();
    const mounted = await mountModal({ warm: false });
    const wrapper = mounted.trigger().parentElement!;

    expect(wrapper.tagName).toBe("SPAN");
    expect(getComputedStyle(wrapper).display).toBe("contents");
    expect(mounted.slotProps.isOpen).toBe(false);
  });

  it("does not schedule an idle preload after the load event of a loading page", async () => {
    const spy = vi.spyOn(window, "requestIdleCallback").mockImplementation(() => 1);
    await whileLoading(async () => {
      await mountModal({ warm: false });
      window.dispatchEvent(new Event("load"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(spy).not.toHaveBeenCalled();
      expect(importWindow).not.toHaveBeenCalled();
    });
  });

  it("preloads on touchstart of the trigger", async () => {
    const mounted = await mountModal({ warm: false });

    mounted.trigger().dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
    await expect.poll(() => vi.mocked(importWindow).mock.calls.length).toBe(1);
    expect(dialogNow()).toBeNull();
  });

  it("preloads on pointerenter and focusin with one shared promise", async () => {
    const mounted = await mountModal({ warm: false });
    const trigger = page.elementLocator(mounted.trigger());

    await userEvent.hover(trigger);
    await expect.poll(() => vi.mocked(importWindow).mock.calls.length).toBe(1);
    await userEvent.unhover(trigger);
    await userEvent.hover(trigger);
    mounted.trigger().dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(vi.mocked(importWindow).mock.calls.length).toBe(1);
    expect(dialogNow()).toBeNull();

    await openModal(mounted);
    expect(vi.mocked(importWindow).mock.calls.length).toBe(1);
  });

  it("preloads on keyboard focus of the trigger", async () => {
    const mounted = await mountModal({ warm: false });

    mounted.trigger().focus();
    await expect.poll(() => vi.mocked(importWindow).mock.calls.length).toBe(1);
  });

  it("keeps an open() asked for before the window has loaded and opens right after", async () => {
    const gate = held();
    const mounted = await mountModal({ warm: false });

    mounted.instance.value!.open();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mounted.model.value).toBe(true);
    expect(mounted.slotProps.isOpen).toBe(true);
    expect(dialogNow()).toBeNull();
    expect(mounted.events).toStrictEqual([]);

    gate.release();
    await expect.poll(() => dialogNow()?.open, { timeout: 15000 }).toBe(true);
    expect(mounted.events).toStrictEqual(["open"]);
    expect(mounted.snapshots[0]).toStrictEqual({ name: "open", open: true, state: "opening" });
    finishAnimations();
    await expect.poll(() => dialogNow()?.dataset.state).toBe("open");
    expect(vi.mocked(importWindow).mock.calls.length).toBe(1);
  });

  it("opens through the trigger before the window has loaded", async () => {
    const gate = held();
    const mounted = await mountModal({ warm: false });

    await userEvent.click(page.elementLocator(mounted.trigger()));
    expect(dialogNow()).toBeNull();
    gate.release();
    await expect.poll(() => dialogNow()?.open, { timeout: 15000 }).toBe(true);
    finishAnimations();
    await expect.poll(() => dialogNow()?.dataset.state).toBe("open");
    await closeModal(mounted);
    expect(document.activeElement).toBe(mounted.trigger());
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("cancels the opening when close() comes while the window is loading", async () => {
    const gate = held();
    const mounted = await mountModal({ warm: false });

    mounted.instance.value!.open();
    await new Promise((resolve) => setTimeout(resolve, 50));
    mounted.instance.value!.close();
    expect(mounted.model.value).toBe(false);

    gate.release();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(dialogNow()?.open ?? false).toBe(false);
    expect(mounted.events).toStrictEqual([]);
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");

    await openModal(mounted);
    expect(mounted.events).toStrictEqual(["open"]);
  });

  it("opens right away with v-model true after a deferred load", async () => {
    const gate = held();
    const mounted = await mountModal({ warm: false, startOpen: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(dialogNow()).toBeNull();

    gate.release();
    await expect.poll(() => dialogNow()?.open, { timeout: 15000 }).toBe(true);
    expect(mounted.events).toStrictEqual(["open"]);
  });

  it("retries once when the chunk fails to load and then opens", async () => {
    vi.mocked(importWindow).mockRejectedValueOnce(new Error("offline"));
    const mounted = await mountModal({ warm: false });

    mounted.instance.value!.open();
    await expect.poll(() => dialogNow()?.open, { timeout: 15000 }).toBe(true);
    expect(vi.mocked(importWindow).mock.calls.length).toBe(2);
    expect(mounted.events).toStrictEqual(["open"]);
  });

  it("gives up after the retry, reports the error, closes and keeps the trigger working", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(importWindow)
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(new Error("offline"));
    const mounted = await mountModal({ warm: false });

    mounted.instance.value!.open();
    await expect.poll(() => mounted.model.value, { timeout: 15000 }).toBe(false);
    expect(vi.mocked(importWindow).mock.calls.length).toBe(2);
    expect(error).toHaveBeenCalled();
    expect(dialogNow()).toBeNull();
    expect(mounted.events).toStrictEqual([]);
    expect(mounted.slotProps.isOpen).toBe(false);
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");

    await openModal(mounted);
    expect(mounted.events).toStrictEqual(["open"]);
    expect(vi.mocked(importWindow).mock.calls.length).toBe(3);
  });

  it("unmounts cleanly while the window is still loading", async () => {
    const gate = held();
    const mounted = await mountModal({ warm: false });

    mounted.instance.value!.open();
    mounted.screen.unmount();
    gate.release();
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(dialogNow()).toBeNull();
    expect(mounted.events).toStrictEqual([]);
  });
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const mounted = await mountModal(item);
    await openModal(mounted);

    await expect
      .element(page.elementLocator(mounted.dialog()))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("opening and closing frames", () => {
  it.each([
    { theme: "torii-synth", name: "opening", time: 300 },
    { theme: "torii-synth", name: "spark", time: 150 },
    { theme: "cyber-sakura", name: "bud", time: 250 },
    { theme: "cyber-sakura", name: "opening", time: 480 },
  ])("$theme $name", async (item) => {
    setTheme(item.theme);
    const mounted = await mountModal();
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().open).toBe(true);
    await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
    expect(pauseAt(item.time).length).toBeGreaterThan(0);

    await expect
      .element(page.elementLocator(mounted.dialog()))
      .toMatchScreenshot(`${item.name}-${item.theme}`, {
        screenshotOptions: { animations: "allow" },
      });
  });

  it.each([
    { theme: "torii-synth", name: "closing", time: 150 },
    { theme: "cyber-sakura", name: "closing", time: 300 },
  ])("$theme $name", async (item) => {
    setTheme(item.theme);
    const mounted = await mountModal();
    await openModal(mounted);
    mounted.instance.value!.close();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    expect(pauseAt(item.time).length).toBeGreaterThan(0);

    await expect
      .element(page.elementLocator(mounted.dialog()))
      .toMatchScreenshot(`${item.name}-${item.theme}`, {
        screenshotOptions: { animations: "allow" },
      });
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const mounted = await mountModal(item);
    await openModal(mounted);
    mounted.dialog().getBoundingClientRect();
    setTheme("cyber-sakura");
    await expect.poll(() => mounted.dialog().querySelector(".modal-bloom-front")).not.toBeNull();

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(mounted.dialog()))
      .toMatchScreenshot(`switch-${item.name}`, { screenshotOptions: { animations: "allow" } });
  });
});

describe("behavior", () => {
  it("renders nothing but the closed dialog until the first opening", async () => {
    const mounted = await mountModal();
    const dialog = mounted.dialog();

    expect(dialog.open).toBe(false);
    expect(dialog.dataset.state).toBe("closed");
    expect(dialog.children).toHaveLength(0);
    expect(getComputedStyle(dialog).display).toBe("none");
    expect(mounted.slotProps.isOpen).toBe(false);
    expect(typeof mounted.slotProps.open).toBe("function");
    expect(typeof mounted.slotProps.close).toBe("function");
  });

  it("opens from the trigger and closes with the close button", async () => {
    const mounted = await mountModal();
    const dialog = mounted.dialog();

    await openModal(mounted);
    expect(dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(true);
    expect(mounted.model.value).toBe(true);
    expect(mounted.slotProps.isOpen).toBe(true);
    expect(dialog.querySelector(".modal-body")).not.toBeNull();

    await closeModal(mounted);
    expect(dialog.open).toBe(false);
    expect(dialog.dataset.state).toBe("closed");
    expect(dialog.children).toHaveLength(0);
    expect(mounted.model.value).toBe(false);
    expect(mounted.slotProps.isOpen).toBe(false);
  });

  it("closes on Escape only after the closing animation has played", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    expect(mounted.dialog().open).toBe(true);
    expect(cssAnimations(mounted.dialog()).length).toBeGreaterThan(0);

    finishAnimations();
    await expect.poll(() => mounted.dialog().open).toBe(false);
    expect(mounted.model.value).toBe(false);
  });

  it("closes on a click on the overlay but not on a click inside the window", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    await userEvent.click(page.elementLocator(mounted.dialog().querySelector(".modal-title")!));
    expect(mounted.dialog().dataset.state).toBe("open");

    await page.elementLocator(mounted.dialog()).click({ position: { x: 20, y: 450 } });
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    finishAnimations();
    await expect.poll(() => mounted.dialog().open).toBe(false);
  });

  it("does not close when a press starts inside the window and ends on the overlay", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const title = dialog.querySelector<HTMLElement>(".modal-title")!;

    title.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    dialog
      .querySelector(".modal-screen")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();

    expect(dialog.dataset.state).toBe("open");
  });

  it("returns the focus to the trigger after closing", async () => {
    const mounted = await mountModal();
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    expect(mounted.dialog().contains(document.activeElement)).toBe(true);

    await closeModal(mounted);
    expect(document.activeElement).toBe(mounted.trigger());
  });

  it("keeps the focus inside the window while tabbing", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    for (let index = 0; index < 8; index += 1) {
      await userEvent.keyboard("{Tab}");
      const active = document.activeElement;
      expect(active === document.body || mounted.dialog().contains(active)).toBe(true);
      expect(active).not.toBe(mounted.trigger());
    }
  });

  it("labels the dialog with the title and names the close button", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const title = dialog.querySelector(".modal-title")!;
    const close = dialog.querySelector(".modal-close")!;

    expect(title.tagName).toBe("H2");
    expect(title.id).not.toBe("");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.hasAttribute("aria-label")).toBe(false);
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("type")).toBe("button");
    expect(close.getAttribute("aria-label")).toBe("Close");
    expect(close.querySelector(".modal-close-icon")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back to the label as the name when there is no title", async () => {
    const mounted = await mountModal({ props: { title: undefined, accent: undefined } });
    await openModal(mounted);
    const dialog = mounted.dialog();

    expect(dialog.hasAttribute("aria-labelledby")).toBe(false);
    expect(dialog.getAttribute("aria-label")).toBe("05 — CONTACT");
  });

  it("draws above the fixed header and covers it", async () => {
    const mounted = await mountModal();
    const header = mounted.screen.container.querySelector("[data-test='header']")!;
    expect(header.contains(document.elementFromPoint(40, 20))).toBe(true);

    await openModal(mounted);
    const hit = document.elementFromPoint(40, 20);

    expect(mounted.dialog().matches(":modal")).toBe(true);
    expect(getComputedStyle(mounted.dialog()).position).toBe("fixed");
    expect(Number.parseInt(getComputedStyle(header).zIndex, 10)).toBe(50);
    expect(header.contains(hit)).toBe(false);
    expect(mounted.dialog().contains(hit)).toBe(true);
  });

  it("locks the page scroll through the data attribute while the window is shown", async () => {
    const mounted = await mountModal({ tall: true });
    const root = document.documentElement;
    const dialog = mounted.dialog();
    const before = {
      overflow: getComputedStyle(root).overflow,
      gutter: getComputedStyle(root).scrollbarGutter,
    };

    expect(before.overflow).not.toBe("hidden");
    expect(dialog.hasAttribute("data-lock-scroll")).toBe(false);

    await openModal(mounted);
    expect(dialog.getAttribute("data-lock-scroll")).toBe("true");
    expect(getComputedStyle(root).overflow).toBe("hidden");
    expect(getComputedStyle(root).scrollbarGutter).toBe("stable");
    expect(root.style.overflow).toBe("");
    expect(root.style.scrollbarGutter).toBe("");

    await closeModal(mounted);
    expect(dialog.hasAttribute("data-lock-scroll")).toBe(false);
    expect(getComputedStyle(root).overflow).toBe(before.overflow);
    expect(getComputedStyle(root).scrollbarGutter).toBe(before.gutter);
  });

  it("keeps the lock through the opening and the closing animation and drops it after", async () => {
    const mounted = await mountModal({ tall: true });
    const dialog = mounted.dialog();
    const root = document.documentElement;

    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => dialog.dataset.state).toBe("opening");
    expect(dialog.getAttribute("data-lock-scroll")).toBe("true");
    expect(getComputedStyle(root).overflow).toBe("hidden");
    finishAnimations();
    await expect.poll(() => dialog.dataset.state).toBe("open");

    await userEvent.click(page.elementLocator(dialog.querySelector(".modal-close")!));
    await expect.poll(() => dialog.dataset.state).toBe("closing");
    expect(dialog.getAttribute("data-lock-scroll")).toBe("true");
    expect(getComputedStyle(root).overflow).toBe("hidden");

    finishAnimations();
    await expect.poll(() => dialog.open).toBe(false);
    expect(dialog.hasAttribute("data-lock-scroll")).toBe(false);
    expect(getComputedStyle(root).overflow).not.toBe("hidden");
  });

  it("never renders the lock attribute as false", async () => {
    const mounted = await mountModal();

    expect(mounted.dialog().getAttributeNames()).not.toContain("data-lock-scroll");
    await openModal(mounted);
    await closeModal(mounted);
    expect(mounted.dialog().outerHTML).not.toContain('data-lock-scroll="false"');
    expect(mounted.dialog().getAttributeNames()).not.toContain("data-lock-scroll");
  });

  it("releases the scroll lock when the component unmounts while open", async () => {
    const mounted = await mountModal({ tall: true });
    await openModal(mounted);
    expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");

    mounted.screen.unmount();
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  });

  it("unlocks the page only after the last of several windows has closed", async () => {
    await page.viewport(1440, 900);
    const models = [ref(false), ref(false)];
    await render(() =>
      h(
        "div",
        { class: "bg-base-100 font-body text-base-content" },
        models.map((model, index) =>
          h(
            UiModal,
            {
              modelValue: model.value,
              "onUpdate:modelValue": (value: boolean) => {
                model.value = value;
              },
              title: `Window ${index}`,
              closeLabel: "Close",
              class: `window-${index}`,
            },
            { default: () => h("p", "content") },
          ),
        ),
      ),
    );
    const dialog = (index: number) =>
      document.querySelector<HTMLDialogElement>(`dialog.window-${index}`)!;
    const locked = () => getComputedStyle(document.documentElement).overflow === "hidden";
    const settle = async (index: number, open: boolean) => {
      await expect
        .poll(() => {
          finishAnimations();
          return Boolean(dialog(index)?.open);
        })
        .toBe(open);
    };

    models[0]!.value = true;
    await settle(0, true);
    models[1]!.value = true;
    await settle(1, true);
    expect(locked()).toBe(true);

    models[0]!.value = false;
    await settle(0, false);
    expect(dialog(0).hasAttribute("data-lock-scroll")).toBe(false);
    expect(dialog(1).getAttribute("data-lock-scroll")).toBe("true");
    expect(locked()).toBe(true);

    models[1]!.value = false;
    await settle(1, false);
    expect(locked()).toBe(false);
  });

  it("opens and closes through the exposed methods", async () => {
    const mounted = await mountModal();

    mounted.instance.value!.open();
    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    expect(mounted.model.value).toBe(true);

    mounted.instance.value!.close();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    finishAnimations();
    await expect.poll(() => mounted.dialog().open).toBe(false);
    expect(mounted.model.value).toBe(false);
  });

  it("follows v-model changes made from the outside", async () => {
    const mounted = await mountModal();

    mounted.model.value = true;
    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");

    mounted.model.value = false;
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    finishAnimations();
    await expect.poll(() => mounted.dialog().open).toBe(false);
  });

  it("opens right away when v-model starts as true", async () => {
    const mounted = await mountModal({ startOpen: true });

    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    expect(mounted.model.value).toBe(true);
  });

  it("waits for the opening to finish before a close that was asked for during it", async () => {
    const mounted = await mountModal();

    mounted.instance.value!.open();
    mounted.instance.value!.close();
    await expect
      .poll(() => {
        finishAnimations();
        return mounted.dialog().dataset.state;
      })
      .toBe("closed");
    expect(mounted.dialog().open).toBe(false);
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  });

  it("can be opened again after it has been closed", async () => {
    const mounted = await mountModal();

    await openModal(mounted);
    await closeModal(mounted);
    await openModal(mounted);

    expect(mounted.dialog().open).toBe(true);
    expect(mounted.dialog().querySelectorAll(".modal-body")).toHaveLength(1);
  });

  it("puts the default slot into the scrolling body after the head", async () => {
    const mounted = await mountModal({
      content: () => h("p", { class: "free-content" }, "Free content"),
    });
    await openModal(mounted);
    const body = mounted.dialog().querySelector(".modal-body")!;
    const order = Array.from(body.children, (element) => element.className.split(" ")[0]);

    expect(order).toStrictEqual(["modal-head", "free-content"]);
    expect(getComputedStyle(body).overflowY).toBe("auto");
  });
});

describe("content sections", () => {
  const sections = (mounted: Mounted) => {
    const dialog = mounted.dialog();
    return {
      head: dialog.querySelector(".modal-head") !== null,
      label: dialog.querySelector(".modal-label")?.textContent?.trim(),
      title: dialog.querySelector(".modal-title")?.firstChild?.textContent?.trim(),
      accent: dialog.querySelector(".modal-accent")?.textContent?.trim(),
      description: dialog.querySelector(".modal-description")?.textContent?.trim(),
    };
  };

  it("renders every section", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    expect(sections(mounted)).toStrictEqual({
      head: true,
      label: "05 — CONTACT",
      title: "Let's grow",
      accent: "together",
      description: baseProps.description,
    });
  });

  it("renders no head without a label, a title and a description", async () => {
    const mounted = await mountModal({
      props: { label: undefined, title: undefined, accent: undefined, description: undefined },
    });
    await openModal(mounted);

    expect(sections(mounted).head).toBe(false);
    expect(mounted.dialog().querySelector(".modal-body")!.children).toHaveLength(1);
  });

  it.each([
    { name: "label", props: { title: undefined, accent: undefined, description: undefined } },
    { name: "title", props: { label: undefined, accent: undefined, description: undefined } },
    { name: "description", props: { label: undefined, title: undefined, accent: undefined } },
  ])("renders only the $name when the rest is empty", async (item) => {
    const mounted = await mountModal({ props: item.props });
    await openModal(mounted);
    const found = sections(mounted);
    const present = (["label", "title", "description"] as const).filter(
      (key) => found[key] !== undefined,
    );

    expect(found.head).toBe(true);
    expect(present).toStrictEqual([item.name]);
    expect(found.accent).toBeUndefined();
  });

  it("does not render the accent without a title", async () => {
    const mounted = await mountModal({ props: { title: undefined } });
    await openModal(mounted);

    expect(mounted.dialog().querySelector(".modal-accent")).toBeNull();
    expect(mounted.dialog().querySelector(".modal-title")).toBeNull();
  });

  it("keeps the title without an accent", async () => {
    const mounted = await mountModal({ props: { accent: undefined } });
    await openModal(mounted);

    expect(sections(mounted).title).toBe("Let's grow");
    expect(sections(mounted).accent).toBeUndefined();
  });

  it("takes the label of the close button from the prop", async () => {
    const mounted = await mountModal({ props: { closeLabel: "Закрыть" } });
    await openModal(mounted);

    expect(mounted.dialog().querySelector(".modal-close")!.getAttribute("aria-label")).toBe(
      "Закрыть",
    );
  });
});

describe("hud strings", () => {
  const hud = (mounted: Mounted) => [
    ...mounted.dialog().querySelectorAll<HTMLElement>("[data-atom-skip]"),
  ];

  it("keeps the technical strings in English and out of the translation animation", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const texts = () =>
      hud(mounted).map((element) => element.textContent?.replace(/\s+/g, " ").trim());

    await expect
      .poll(texts)
      .toStrictEqual(
        expect.arrayContaining([
          "INITIALIZING · HOLO-LINK",
          "SYS://CONTACT.MODULE",
          "HOLO-LINK · ENCRYPTED",
          "X 0.50 · Y 0.50 · v1.0",
        ]),
      );
    expect(texts()).not.toContain("BLOOMING…");

    setTheme("cyber-sakura");
    await expect.poll(texts).toContain("BLOOMING…");
    for (const element of hud(mounted)) expect(element.getAttribute("lang")).toBe("en");
  });

  it("puts the module name in upper case into the label", async () => {
    const mounted = await mountModal({ props: { module: "Projects" } });
    await openModal(mounted);

    expect(mounted.dialog().querySelector(".modal-holo-hud")!.textContent).toContain(
      "SYS://PROJECTS.MODULE",
    );
  });

  it("uses a default module name", async () => {
    const mounted = await mountModal({ props: { module: undefined } });
    await openModal(mounted);

    expect(mounted.dialog().querySelector(".modal-holo-hud")!.textContent).toContain(
      "SYS://MODULE.MODULE",
    );
  });

  it("keeps the HUD strings out of the accessibility tree", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    for (const element of hud(mounted)) {
      expect(element.closest("[aria-hidden='true']")).not.toBeNull();
    }
  });
});

describe.each(themes)("animation of %s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  const holoOpening = [
    ["modal-overlay-in", 240],
    ["modal-holo-spark-in", 558],
    ["modal-holo-screen-in", 600],
    ["modal-holo-content-in", 558],
  ] as const;

  const holoClosing = [
    ["modal-overlay-out", 564],
    ["modal-holo-spark-out", 564],
    ["modal-holo-screen-out", 264],
    ["modal-holo-content-out", 84],
  ] as const;

  const bloomOpening = [
    ["modal-overlay-in", 240],
    ["modal-bloom-halo-in", 660],
    ["modal-bloom-grow-in", 1020],
    ["modal-bloom-base-in", 150],
    ["modal-bloom-box-in", 1020],
    ["modal-bloom-edge-in", 1020],
    ["modal-bloom-inner-in", 1020],
    ["modal-bloom-peel-in", 720],
    ["modal-bloom-content-in", 1020],
    ["modal-bloom-shards-in", 1080],
  ] as const;

  const bloomClosing = [
    ["modal-overlay-out", 480],
    ["modal-bloom-halo-out", 1044],
    ["modal-bloom-grow-out", 1044],
    ["modal-bloom-base-out", 1044],
    ["modal-bloom-box-out", 1044],
    ["modal-bloom-edge-out", 1044],
    ["modal-bloom-inner-out", 1044],
    ["modal-bloom-peel-out", 504],
    ["modal-bloom-content-out", 144],
    ["modal-bloom-shards-out", 204],
  ] as const;

  const isHolo = theme === "torii-synth";
  const opening = isHolo ? holoOpening : bloomOpening;
  const closing = isHolo ? holoClosing : bloomClosing;

  async function startOpening() {
    const mounted = await mountModal();
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().open).toBe(true);
    await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
    return mounted;
  }

  async function startClosing() {
    const mounted = await mountModal();
    await openModal(mounted);
    await userEvent.click(page.elementLocator(mounted.dialog().querySelector(".modal-close")!));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    return mounted;
  }

  it("plays the opening of the mockup with its timings", async () => {
    const mounted = await startOpening();
    const dialog = mounted.dialog();

    for (const [name, duration] of opening) expect(durationOf(dialog, name)).toBe(duration);
    expect(animationNames(dialog)).toHaveLength(opening.length + (isHolo ? 0 : 1));
  });

  it("plays only the animations of the active theme", async () => {
    const mounted = await startOpening();
    const foreign = isHolo ? "modal-bloom" : "modal-holo";

    expect(animationNames(mounted.dialog()).some((name) => name.startsWith(foreign))).toBe(false);
  });

  it("ends the opening in the resting state", async () => {
    const mounted = await startOpening();
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    const dialog = mounted.dialog();
    const body = dialog.querySelector(".modal-body")!;

    expect(cssAnimations(dialog)).toHaveLength(0);
    expect(getComputedStyle(body).opacity).toBe("1");
    expect(getComputedStyle(body).transform).toBe("none");
    expect(getComputedStyle(dialog.querySelector(".modal-screen")!).clipPath).toBe("none");
    expect(getComputedStyle(dialog.querySelector(".modal-box")!).transform).toBe("none");
    if (isHolo) {
      expect(getComputedStyle(dialog.querySelector(".modal-holo-spark")!).opacity).toBe("0");
    } else {
      expect(getComputedStyle(dialog.querySelector(".modal-bloom-peel")!).opacity).toBe("0");
      expect(getComputedStyle(dialog.querySelector(".modal-bloom-halo")!).opacity).toBe("0");
      expect(getComputedStyle(dialog.querySelector(".modal-bloom-grow")!).transform).toBe("none");
      expect(getComputedStyle(dialog.querySelector(".modal-bloom-shards")!).opacity).toBe("1");
    }
  });

  it("starts from the collapsed state", async () => {
    const mounted = await startOpening();
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = 0;
    }
    const dialog = mounted.dialog();

    expect(getComputedStyle(dialog.querySelector(".modal-body")!).opacity).toBe("0");
    if (isHolo) {
      expect(getComputedStyle(dialog.querySelector(".modal-screen")!).clipPath).toBe(
        "inset(0px 50%)",
      );
    } else {
      const box = getComputedStyle(dialog.querySelector(".modal-box")!);
      expect(box.opacity).toBe("0");
      expect(box.transform).not.toBe("none");
    }
  });

  it("plays the closing in the reverse order with the timings of the mockup", async () => {
    const mounted = await startClosing();
    const dialog = mounted.dialog();

    for (const [name, duration] of closing) expect(durationOf(dialog, name)).toBe(duration);
    expect(animationNames(dialog)).toHaveLength(closing.length + (isHolo ? 0 : 1));
  });

  it("closes the dialog only after the closing animation has finished", async () => {
    const mounted = await startClosing();
    const dialog = mounted.dialog();

    await nextTick();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector(".modal-body")).not.toBeNull();

    finishAnimations();
    await expect.poll(() => dialog.open).toBe(false);
    expect(dialog.dataset.state).toBe("closed");
  });

  it("keeps the overlay fading until the window is gone", async () => {
    const mounted = await startClosing();
    const animations = cssAnimations(mounted.dialog());
    const ends = animations.map((item) => Number(item.effect?.getComputedTiming().endTime));
    const overlay = animations.find((item) => item.animationName === "modal-overlay-out")!;
    const end = Number(overlay.effect?.getComputedTiming().endTime);

    expect(end).toBe(Math.max(...ends));
    expect(overlay.effect?.getComputedTiming().delay).toBe(isHolo ? 0 : 684);
  });
});

describe.each(themes)("reduced motion in %s", (theme) => {
  beforeEach(async () => {
    setTheme(theme);
    await setReducedMotion("reduce");
  });

  it("shows and hides the window at once without waiting for animations", async () => {
    const mounted = await mountModal();
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    const dialog = mounted.dialog();

    expect(cssAnimations(dialog)).toHaveLength(0);
    expect(getComputedStyle(dialog.querySelector(".modal-body")!).opacity).toBe("1");
    expect(getComputedStyle(dialog.querySelector(".modal-box")!).transform).toBe("none");

    await userEvent.click(page.elementLocator(dialog.querySelector(".modal-close")!));
    await expect.poll(() => dialog.open).toBe(false);
    expect(dialog.dataset.state).toBe("closed");
  });

  it("switches the theme of an open window without transitions", async () => {
    const mounted = await mountModal();
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    const windowElement = mounted.dialog().querySelector(".modal-window")!;

    setTheme(theme === "torii-synth" ? "cyber-sakura" : "torii-synth");
    await nextTick();

    expect(transitioning(windowElement, "width")).toBe(false);
    expect(
      dialogAnimations(mounted.dialog())
        .filter((item) => item instanceof CSSTransition)
        .map(
          (item) =>
            `${(item.effect as KeyframeEffect).target?.className} ${(item.effect as KeyframeEffect).pseudoElement} ${item.transitionProperty}`,
        ),
    ).toStrictEqual([]);
  });
});

describe("decor of the inactive theme", () => {
  it("mounts only the layers of the active theme, also after the page has loaded", async () => {
    setTheme("torii-synth");
    await whileLoading(async () => {
      const mounted = await mountModal();
      await openModal(mounted);
      const dialog = mounted.dialog();
      await expect.poll(() => dialog.querySelector(".modal-holo-glass")).not.toBeNull();

      expect(dialog.querySelector(".modal-holo")).not.toBeNull();
      expect(dialog.querySelector(".modal-bloom")).toBeNull();
      expect(dialog.querySelector(".modal-bloom-skin")).toBeNull();
      expect(dialog.querySelector(".modal-bloom-front")).toBeNull();
      expect(dialog.querySelectorAll("img[src*='cyber-sakura']")).toHaveLength(0);

      window.dispatchEvent(new Event("load"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(dialog.querySelector(".modal-bloom-skin")).toBeNull();
      expect(dialog.querySelectorAll("img[src*='cyber-sakura']")).toHaveLength(0);
    });
  });

  it("mounts the layers of a theme only when it becomes active and keeps the previous ones", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    await expect.poll(() => dialog.querySelector(".modal-holo-glass")).not.toBeNull();
    expect(dialog.querySelector(".modal-bloom")).toBeNull();

    setTheme("cyber-sakura");
    await expect.poll(() => dialog.querySelector(".modal-bloom-skin")).not.toBeNull();
    expect(dialog.querySelector(".modal-bloom")).not.toBeNull();
    expect(dialog.querySelector(".modal-bloom-front")).not.toBeNull();
    expect(dialog.querySelector(".modal-bloom-vein")).not.toBeNull();
    expect(dialog.querySelector(".modal-holo-glass")).not.toBeNull();
  });

  it("mounts only the active layers again on the next opening", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    setTheme("cyber-sakura");
    await expect.poll(() => mounted.dialog().querySelector(".modal-bloom")).not.toBeNull();
    await closeModal(mounted);

    await openModal(mounted);
    await expect.poll(() => mounted.dialog().querySelector(".modal-bloom")).not.toBeNull();
    expect(mounted.dialog().querySelector(".modal-holo-glass")).toBeNull();
  });

  it("hides the layers of the inactive theme through the theme selector", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    await expect.poll(() => dialog.querySelector(".modal-holo-glass")).not.toBeNull();
    setTheme("cyber-sakura");
    await expect.poll(() => dialog.querySelector(".modal-bloom-skin")).not.toBeNull();
    finishAnimations();
    const glass = dialog.querySelector<HTMLElement>(".modal-holo-glass")!;

    expect(getComputedStyle(glass).opacity).toBe("0");
    expect(getComputedStyle(glass).visibility).toBe("hidden");
    expect(visible(dialog.querySelector(".modal-bloom")!)).toBe(true);
  });
});

describe("layout of the window", () => {
  it("matches the mockup of Torii Synth on desktop", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const windowRect = box(mounted, ".modal-window");
    const rel = (selector: string) => {
      const rect = box(mounted, selector);
      return { left: rect.left - windowRect.left, top: rect.top - windowRect.top, rect };
    };

    near(windowRect.width, 600);
    near(windowRect.left + windowRect.width / 2, viewportWidth(mounted) / 2);
    near(windowRect.top + windowRect.height / 2, 450);
    expect(windowRect.height).toBeLessThanOrEqual(900 - 48);
    near(rel(".modal-close").left, 524.5);
    near(rel(".modal-close").top, 23.5);
    near(rel(".modal-close").rect.width, 40);
    near(rel(".modal-close").rect.height, 40);
    near(rel(".modal-bar").rect.height, 59);
    near(rel(".modal-label").left, 36.5);
    near(rel(".modal-label").top, 100.5, 2);
    near(rel(".modal-title").top, 126.5, 2);
    near(rel(".modal-description").top, 182.5, 3);

    const title = getComputedStyle(dialog.querySelector(".modal-title")!);
    const label = getComputedStyle(dialog.querySelector(".modal-label")!);
    near(Number.parseFloat(title.fontSize), 40, 0.1);
    expect(title.fontFamily).toContain("Righteous");
    expect(title.textShadow).not.toBe("none");
    near(Number.parseFloat(label.fontSize), 14, 0.1);
    near(Number.parseFloat(label.letterSpacing), 4.2, 0.1);
    expect(label.textTransform).toBe("uppercase");
    expect(getComputedStyle(dialog.querySelector(".modal-box")!).paddingTop).toBe("1.5px");
    expect(getComputedStyle(dialog.querySelector(".modal-box")!, "::before").clipPath).toContain(
      "22px",
    );
    expect(getComputedStyle(dialog.querySelector(".modal-inner")!).clipPath).toContain("21px");
    expect(getComputedStyle(dialog.querySelector(".modal-inner")!).paddingTop).toBe("18px");
    expect(getComputedStyle(dialog.querySelector(".modal-window")!).filter).toContain(
      "drop-shadow",
    );
    expect(
      getComputedStyle(dialog.querySelector(".modal-box")!, "::before").backgroundImage,
    ).toContain("linear-gradient(120deg");
    const hud = getComputedStyle(dialog.querySelector(".modal-holo-hud")!);
    expect(hud.fontFamily).toContain("Share Tech Mono");
    near(Number.parseFloat(hud.fontSize), 14, 0.1);
  });

  it("matches the mockup of Cyber Sakura on desktop", async () => {
    setTheme("cyber-sakura");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const windowRect = box(mounted, ".modal-window");
    const rel = (selector: string) => {
      const rect = box(mounted, selector);
      return { left: rect.left - windowRect.left, top: rect.top - windowRect.top, rect };
    };

    near(windowRect.width, 640);
    near(windowRect.left + windowRect.width / 2, viewportWidth(mounted) / 2 + 40);
    near(windowRect.top + windowRect.height / 2, 450 - 48);
    near(rel(".modal-close").left, 572.5);
    near(rel(".modal-close").top, 23.5);
    near(rel(".modal-close").rect.width, 44);
    near(rel(".modal-close").rect.height, 44);
    near(rel(".modal-label").left, 73.5);
    near(rel(".modal-label").top, 61.5, 2);
    near(rel(".modal-title").top, 87.5, 2);
    near(rel(".modal-description").top, 143.5, 3);
    expect(rel(".modal-bar").rect.height).toBe(0);

    const boxStyle = getComputedStyle(dialog.querySelector(".modal-box")!);
    const inner = getComputedStyle(dialog.querySelector(".modal-inner")!);
    expect(boxStyle.borderTopLeftRadius).toBe("180px");
    expect(boxStyle.borderTopRightRadius).toBe("30px");
    expect(boxStyle.borderBottomRightRadius).toBe("180px");
    expect(boxStyle.borderBottomLeftRadius).toBe("30px");
    expect(boxStyle.boxShadow).not.toBe("none");
    expect(inner.borderTopLeftRadius).toBe("178.5px");
    expect(inner.borderTopRightRadius).toBe("28.5px");
    expect(inner.paddingTop).toBe("60px");
    expect(inner.paddingLeft).toBe("72px");
    expect(inner.paddingBottom).toBe("72px");
    expect(getComputedStyle(dialog.querySelector(".modal-close")!).borderTopLeftRadius).toBe("50%");
    expect(
      getComputedStyle(dialog.querySelector(".modal-box")!, "::before").backgroundImage,
    ).toContain("linear-gradient(135deg");
    near(Number.parseFloat(getComputedStyle(dialog.querySelector(".modal-title")!).fontSize), 40);
    expect(getComputedStyle(dialog.querySelector(".modal-title")!).textShadow).toBe(
      "rgba(0, 0, 0, 0) 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px",
    );
  });

  it("scales the title down in Russian and switches its font", async () => {
    const mounted = await mountModal({ lang: "ru", props: { title: "Давайте расти" } });
    await openModal(mounted);
    const title = getComputedStyle(mounted.dialog().querySelector(".modal-title")!);

    near(Number.parseFloat(title.fontSize), 30, 0.1);
    expect(title.fontFamily).toContain("Montserrat Alternates");
  });

  it.each(themes)("fills the screen on a phone in %s", async (theme) => {
    setTheme(theme);
    const mounted = await mountModal({ width: 390, height: 780, content: longContent });
    await openModal(mounted);
    const windowRect = box(mounted, ".modal-window");
    const body = mounted.dialog().querySelector<HTMLElement>(".modal-body")!;
    const sakura = theme === "cyber-sakura";

    near(windowRect.width, viewportWidth(mounted) - (sakura ? 56 : 32));
    near(windowRect.left, sakura ? 40 : 16);
    near(windowRect.top, 24);
    near(windowRect.bottom, sakura ? 780 - 48 : 780 - 24);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    expect(body.offsetWidth - body.clientWidth).toBeGreaterThan(0);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    expect(mounted.dialog().scrollWidth).toBeLessThanOrEqual(mounted.dialog().clientWidth);
  });

  it("hides the ticks of the header and keeps the footer short on a phone", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal({ width: 390, height: 780 });
    await openModal(mounted);
    const dialog = mounted.dialog();

    expect(getComputedStyle(dialog.querySelector(".modal-holo-ticks")!).display).toBe("none");
    expect(getComputedStyle(dialog.querySelector(".modal-holo-foot-coords")!).display).toBe("none");
  });

  it("shows the ticks and the whole footer from the tablet width", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal({ width: 768, height: 900 });
    await openModal(mounted);
    const dialog = mounted.dialog();

    expect(getComputedStyle(dialog.querySelector(".modal-holo-ticks")!).display).toBe("block");
    expect(getComputedStyle(dialog.querySelector(".modal-holo-foot-coords")!).display).toBe(
      "block",
    );
  });

  it.each([
    { width: 390, height: 780, scale: "0.35" },
    { width: 768, height: 900, scale: "0.65" },
    { width: 1440, height: 900, scale: "1" },
  ])("scales the frame of the bloom to $scale at $width", async (item) => {
    setTheme("cyber-sakura");
    const mounted = await mountModal(item);
    await openModal(mounted);
    const anchor = mounted.dialog().querySelector(".modal-bloom-anchor")!;

    expect(getComputedStyle(anchor).scale).toBe(item.scale);
  });

  it("scrolls inside the window on a short desktop screen", async () => {
    const mounted = await mountModal({ width: 1440, height: 600 });
    await openModal(mounted);
    const body = mounted.dialog().querySelector<HTMLElement>(".modal-body")!;

    expect(box(mounted, ".modal-window").height).toBeLessThanOrEqual(600 - 48);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  });
});

describe("theme switch of an open window", () => {
  it("animates the shape, the shadow and the fills", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const query = (selector: string) => dialog.querySelector(selector)!;
    dialog.getBoundingClientRect();
    setTheme("cyber-sakura");

    expect(transitioning(query(".modal-window"), "width")).toBe(true);
    expect(transitioning(query(".modal-window"), "translate")).toBe(true);
    expect(transitioning(query(".modal-window"), "filter")).toBe(true);
    expect(transitioning(query(".modal-box"), "border-top-left-radius")).toBe(true);
    expect(transitioning(query(".modal-box"), "box-shadow")).toBe(true);
    expect(transitioning(query(".modal-box"), "clip-path", "::before")).toBe(true);
    expect(transitioning(query(".modal-box"), "border-top-left-radius", "::before")).toBe(true);
    expect(transitioning(query(".modal-box"), "--modal-edge-from", "::before")).toBe(true);
    expect(transitioning(query(".modal-box"), "--modal-edge-angle", "::before")).toBe(true);
    expect(transitioning(query(".modal-inner"), "clip-path")).toBe(true);
    expect(transitioning(query(".modal-inner"), "border-top-left-radius")).toBe(true);
    expect(transitioning(query(".modal-inner"), "padding-top")).toBe(true);
    expect(transitioning(query(".modal-inner"), "opacity", "::before")).toBe(true);
    expect(transitioning(query(".modal-inner"), "opacity", "::after")).toBe(true);
    expect(transitioning(query(".modal-bar"), "height")).toBe(true);
    expect(transitioning(query(".modal-title"), "text-shadow")).toBe(true);
    expect(transitioning(query(".modal-accent"), "--modal-accent-from")).toBe(true);
    expect(transitioning(query(".modal-close"), "border-top-left-radius")).toBe(true);
    expect(transitioning(query(".modal-close"), "width")).toBe(true);
    expect(transitioning(query(".modal-close"), "clip-path", "::before")).toBe(true);
    await nextTick();
    expect(transitioning(query(".modal-holo-glass"), "opacity")).toBe(true);
    await expect.poll(() => dialog.querySelector(".modal-bloom-front")).not.toBeNull();
    expect(transitioning(query(".modal-bloom"), "opacity")).toBe(true);

    finishAnimations();
    expect(getComputedStyle(query(".modal-holo-glass")).opacity).toBe("0");
    expect(getComputedStyle(query(".modal-holo-glass")).visibility).toBe("hidden");
    expect(getComputedStyle(query(".modal-bloom")).opacity).toBe("1");
    expect(getComputedStyle(query(".modal-bloom")).visibility).toBe("visible");
    expect(getComputedStyle(query(".modal-bloom-front")).visibility).toBe("visible");
  });

  it("keeps the same number of points in the clip paths of both themes", async () => {
    const count = (value: string) => value.split(",").length;
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();
    const read = () => [
      getComputedStyle(dialog.querySelector(".modal-box")!, "::before").clipPath,
      getComputedStyle(dialog.querySelector(".modal-inner")!).clipPath,
      getComputedStyle(dialog.querySelector(".modal-close")!, "::before").clipPath,
    ];
    const holo = read();
    setTheme("cyber-sakura");
    finishAnimations();
    const bloom = read();

    expect(holo.map(count)).toStrictEqual(bloom.map(count));
    for (const value of holo) expect(value).toContain("polygon");
  });

  it("goes back to the shape of Torii Synth", async () => {
    setTheme("cyber-sakura");
    const mounted = await mountModal();
    await openModal(mounted);
    setTheme("torii-synth");
    finishAnimations();
    const windowRect = box(mounted, ".modal-window");

    near(windowRect.width, 600);
    near(windowRect.left + windowRect.width / 2, viewportWidth(mounted) / 2);
    expect(
      getComputedStyle(mounted.dialog().querySelector(".modal-box")!).borderTopLeftRadius,
    ).toBe("0px");
  });
});

describe.each(themes)("close button in %s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it("animates on hover", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const close = mounted.dialog().querySelector<HTMLElement>(".modal-close")!;
    const icon = close.querySelector<HTMLElement>(".modal-close-icon")!;
    const before = getComputedStyle(close, "::before").backgroundColor;

    await userEvent.hover(page.elementLocator(close));
    expect(transitioning(icon, "transform")).toBe(true);
    expect(transitioning(close, "background-color", "::before")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(icon).transform).toBe("matrix(0, 1, -1, 0, 0, 0)");
    expect(getComputedStyle(close, "::before").backgroundColor).not.toBe(before);
  });

  it("shows a focus ring for the keyboard", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const close = mounted.dialog().querySelector<HTMLElement>(".modal-close")!;

    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(close);
    expect(transitioning(close, "outline-color")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(close).outlineStyle).toBe("solid");
    expect(getComputedStyle(close).outlineColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("uses the icon and the size of its theme", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    const close = mounted.dialog().querySelector<HTMLElement>(".modal-close")!;
    const icon = close.querySelector(".modal-close-icon")!;

    expect(getComputedStyle(icon).maskImage).toContain(
      theme === "torii-synth" ? "stroke-linecap='square'" : "stroke-linecap='round'",
    );
    expect(close.getBoundingClientRect().width).toBe(theme === "torii-synth" ? 40 : 44);
    expect(getComputedStyle(close).cursor).toBe("pointer");
  });
});

function keyframeNames(prefix: string) {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSKeyframesRule) {
        if (rule.name.startsWith(prefix)) names.add(rule.name);
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      continue;
    }
  }
  return [...names].sort();
}

function declaredAnimationNames(dialog: HTMLDialogElement) {
  const found = new Map<string, string[]>();
  const add = (element: Element, pseudo: string | null) => {
    const names = getComputedStyle(element, pseudo).animationName.split(/,\s*/);
    for (const name of names) {
      if (name === "none") continue;
      const place = `${element.className || element.tagName}${pseudo ?? ""}`;
      found.set(name, [...(found.get(name) ?? []), place]);
    }
  };
  add(dialog, "::backdrop");
  for (const element of [dialog, ...dialog.querySelectorAll("*")]) {
    for (const pseudo of [null, "::before", "::after"]) add(element, pseudo);
  }
  return found;
}

function leaks(dialog: HTMLDialogElement, foreign: string[]) {
  const declared = declaredAnimationNames(dialog);
  const running = cssAnimations(dialog).map((animation) => animation.animationName);
  return {
    declared: [...declared.keys()].filter((name) => foreign.includes(name)),
    running: running.filter((name) => foreign.includes(name)),
  };
}

function visible(element: Element) {
  const style = getComputedStyle(element);
  return style.visibility === "visible" && style.opacity === "1";
}

describe("isolation of the theme animations", () => {
  const holo: string[] = [];
  const bloom: string[] = [];

  beforeAll(async () => {
    await Promise.all([importHolo(), importBloom()]);
    holo.push(...keyframeNames("modal-holo"));
    bloom.push(...keyframeNames("modal-bloom"));
  });

  it("finds the keyframes of both themes in the styles", () => {
    expect(holo).toStrictEqual([
      "modal-holo-content-in",
      "modal-holo-content-out",
      "modal-holo-screen-in",
      "modal-holo-screen-out",
      "modal-holo-spark-in",
      "modal-holo-spark-out",
    ]);
    expect(bloom).toHaveLength(18);
    expect(bloom.every((name) => /-(in|out)$/.test(name))).toBe(true);
  });

  describe.each([
    { theme: "torii-synth", foreign: bloom, own: "modal-holo-screen" },
    { theme: "cyber-sakura", foreign: holo, own: "modal-bloom-box" },
  ])("in $theme", ({ theme, foreign, own }) => {
    beforeEach(() => {
      setTheme(theme);
    });

    it("never declares or runs the keyframes of the other theme while opening, open and closing", async () => {
      const mounted = await mountModal();
      await userEvent.click(page.elementLocator(mounted.trigger()));
      await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
      const dialog = mounted.dialog();

      expect(leaks(dialog, foreign)).toStrictEqual({ declared: [], running: [] });
      expect([...declaredAnimationNames(dialog).keys()].some((name) => name.startsWith(own))).toBe(
        true,
      );

      finishAnimations();
      await expect.poll(() => dialog.dataset.state).toBe("open");
      expect(leaks(dialog, foreign)).toStrictEqual({ declared: [], running: [] });
      expect(declaredAnimationNames(dialog).size).toBe(0);

      await userEvent.click(page.elementLocator(dialog.querySelector(".modal-close")!));
      await expect.poll(() => dialog.dataset.state).toBe("closing");
      expect(leaks(dialog, foreign)).toStrictEqual({ declared: [], running: [] });
      expect([...declaredAnimationNames(dialog).keys()].some((name) => name.startsWith(own))).toBe(
        true,
      );
    });

    it("keeps the decor of the other theme out of the dialog until that theme is active", async () => {
      const mounted = await mountModal();
      await userEvent.click(page.elementLocator(mounted.trigger()));
      await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
      const dialog = mounted.dialog();
      const sakura = theme === "cyber-sakura";
      const own = sakura ? ".modal-layer-sakura" : ".modal-layer-torii";
      const other = sakura ? ".modal-layer-torii" : ".modal-layer-sakura";

      await expect.poll(() => dialog.querySelectorAll(own).length).toBeGreaterThan(0);
      expect(dialog.querySelectorAll(other)).toHaveLength(0);
    });

    it("keeps the decor of the other theme hidden and without animations after a round trip", async () => {
      const mounted = await mountModal();
      await openModal(mounted);
      const dialog = mounted.dialog();
      const sakura = theme === "cyber-sakura";
      const own = sakura ? ".modal-layer-sakura" : ".modal-layer-torii";
      const other = sakura ? ".modal-layer-torii" : ".modal-layer-sakura";

      setTheme(sakura ? "torii-synth" : "cyber-sakura");
      await expect.poll(() => dialog.querySelectorAll(other).length).toBeGreaterThan(0);
      setTheme(theme);
      await nextTick();
      dialog.getBoundingClientRect();
      finishAnimations();

      for (const layer of dialog.querySelectorAll(other)) {
        expect(getComputedStyle(layer).visibility).toBe("hidden");
        expect(getComputedStyle(layer).opacity).toBe("0");
        for (const element of [layer, ...layer.querySelectorAll("*")]) {
          expect(getComputedStyle(element).animationName).toBe("none");
        }
      }
      for (const layer of dialog.querySelectorAll(own)) {
        expect(getComputedStyle(layer).visibility).toBe("visible");
      }
    });

    it("does not let the other theme delay the closing", async () => {
      const mounted = await mountModal();
      await openModal(mounted);
      const dialog = mounted.dialog();
      await userEvent.click(page.elementLocator(dialog.querySelector(".modal-close")!));
      await expect.poll(() => dialog.dataset.state).toBe("closing");
      const names = cssAnimations(dialog).map((item) => item.animationName);

      expect(names.every((name) => !foreign.includes(name))).toBe(true);
      finishAnimations();
      await expect.poll(() => dialog.open).toBe(false);
    });
  });

  it.each([
    { from: "torii-synth", to: "cyber-sakura", foreign: holo },
    { from: "cyber-sakura", to: "torii-synth", foreign: bloom },
  ])("leaves no animations of $from after switching to $to while open", async (item) => {
    setTheme(item.from);
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();

    setTheme(item.to);
    await nextTick();
    expect(leaks(dialog, item.foreign)).toStrictEqual({ declared: [], running: [] });
    expect(cssAnimations(dialog)).toHaveLength(0);
    finishAnimations();
    expect(declaredAnimationNames(dialog).size).toBe(0);
  });

  it.each([
    { from: "torii-synth", to: "cyber-sakura", foreign: holo },
    { from: "cyber-sakura", to: "torii-synth", foreign: bloom },
  ])(
    "settles into the resting state of $to when the theme changes during the opening",
    async (item) => {
      setTheme(item.from);
      const mounted = await mountModal();
      await userEvent.click(page.elementLocator(mounted.trigger()));
      await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
      const dialog = mounted.dialog();

      setTheme(item.to);
      await expect
        .poll(() => {
          finishAnimations();
          return dialog.dataset.state;
        })
        .toBe("open");
      expect(leaks(dialog, item.foreign)).toStrictEqual({ declared: [], running: [] });
      expect(cssAnimations(dialog)).toHaveLength(0);
      expect(getComputedStyle(dialog.querySelector(".modal-body")!).opacity).toBe("1");
      expect(getComputedStyle(dialog.querySelector(".modal-box")!).transform).toBe("none");
      expect(getComputedStyle(dialog.querySelector(".modal-screen")!).clipPath).toBe("none");
    },
  );
});

describe("theme that the attribute and useTheme report at different moments", () => {
  const sakuraLayers = (dialog: HTMLDialogElement) =>
    [...dialog.querySelectorAll(".modal-layer-sakura")] as HTMLElement[];
  const toriiLayers = (dialog: HTMLDialogElement) =>
    [...dialog.querySelectorAll(".modal-layer-torii")] as HTMLElement[];

  async function startOpening(mounted: Mounted) {
    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("opening");
    return mounted.dialog();
  }

  async function expectSakura(dialog: HTMLDialogElement) {
    expect(sakuraLayers(dialog).length).toBeGreaterThan(0);
    for (const layer of toriiLayers(dialog)) {
      expect(getComputedStyle(layer).visibility).toBe("hidden");
      expect(getComputedStyle(layer).opacity).toBe("0");
    }
    expect(leaks(dialog, keyframeNames("modal-holo"))).toStrictEqual({ declared: [], running: [] });
    expect(animationNames(dialog)).toContain("modal-bloom-box-in");
    finishAnimations();
    await expect.poll(() => dialog.dataset.state).toBe("open");
    for (const layer of sakuraLayers(dialog)) {
      expect(getComputedStyle(layer).visibility).toBe("visible");
    }
    expect(visible(dialog.querySelector(".modal-bloom")!)).toBe(true);
    expect(visible(dialog.querySelector(".modal-bloom-front")!)).toBe(true);
  }

  async function expectTorii(dialog: HTMLDialogElement) {
    expect(toriiLayers(dialog).length).toBeGreaterThan(0);
    for (const layer of sakuraLayers(dialog)) {
      expect(getComputedStyle(layer).visibility).toBe("hidden");
      expect(getComputedStyle(layer).opacity).toBe("0");
    }
    expect(leaks(dialog, keyframeNames("modal-bloom"))).toStrictEqual({
      declared: [],
      running: [],
    });
    expect(animationNames(dialog)).toContain("modal-holo-screen-in");
    finishAnimations();
    await expect.poll(() => dialog.dataset.state).toBe("open");
    expect(visible(dialog.querySelector(".modal-holo-glass")!)).toBe(true);
  }

  it("opens the bloom when the attribute is already light and useTheme still reports the dark theme", async () => {
    setTheme("torii-synth");
    document.documentElement.dataset.theme = "cyber-sakura";
    const mounted = await mountModal();
    await expectSakura(await startOpening(mounted));
  });

  it("opens the holo when the attribute is already dark and useTheme still reports the light theme", async () => {
    setTheme("cyber-sakura");
    document.documentElement.dataset.theme = "torii-synth";
    const mounted = await mountModal();
    await expectTorii(await startOpening(mounted));
  });

  it("opens correctly when the theme changed a moment before the opening", async () => {
    const mounted = await mountModal();
    document.documentElement.dataset.theme = "cyber-sakura";
    await expectSakura(await startOpening(mounted));
  });

  it("mounts the layers of the attribute theme before the page has loaded", async () => {
    setTheme("torii-synth");
    await whileLoading(async () => {
      document.documentElement.dataset.theme = "cyber-sakura";
      const mounted = await mountModal();
      const dialog = await startOpening(mounted);

      expect(dialog.querySelector(".modal-bloom")).not.toBeNull();
      expect(dialog.querySelector(".modal-bloom-skin")).not.toBeNull();
      await expectSakura(dialog);
    });
  });

  it("shows no layer of the dark theme in the first frame of a light page", async () => {
    setTheme("torii-synth");
    document.documentElement.dataset.theme = "cyber-sakura";
    const mounted = await mountModal();
    const dialog = await startOpening(mounted);

    for (const layer of toriiLayers(dialog)) {
      expect(getComputedStyle(layer).visibility).toBe("hidden");
    }
    expect(visible(dialog.querySelector(".modal-bloom")!)).toBe(true);
    finishAnimations();
  });

  it("follows an attribute change of an open window that useTheme has not reported yet", async () => {
    setTheme("torii-synth");
    const mounted = await mountModal();
    await openModal(mounted);
    const dialog = mounted.dialog();

    document.documentElement.dataset.theme = "cyber-sakura";
    await expect
      .poll(() => {
        dialog.getBoundingClientRect();
        finishAnimations();
        return visible(dialog.querySelector(".modal-bloom")!);
      })
      .toBe(true);
    expect(getComputedStyle(dialog.querySelector(".modal-holo-glass")!).visibility).toBe("hidden");
    expect(cssAnimations(dialog)).toHaveLength(0);
  });

  it("closes without waiting for the layers of the other theme", async () => {
    setTheme("torii-synth");
    document.documentElement.dataset.theme = "cyber-sakura";
    const mounted = await mountModal();
    await openModal(mounted);
    await closeModal(mounted);

    expect(mounted.dialog().open).toBe(false);
  });
});

describe("open and close events", () => {
  const settleClosed = async (mounted: Mounted) => {
    await expect
      .poll(() => {
        finishAnimations();
        return mounted.dialog().dataset.state;
      })
      .toBe("closed");
  };

  it("emits nothing when a closed window is mounted", async () => {
    const mounted = await mountModal();
    await nextTick();

    expect(mounted.events).toStrictEqual([]);
  });

  it("emits open when v-model starts as true", async () => {
    const mounted = await mountModal({ startOpen: true });
    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");

    expect(mounted.events).toStrictEqual(["open"]);
  });

  it("opens through the trigger and closes through the close button with one event each", async () => {
    const mounted = await mountModal();

    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().open).toBe(true);
    expect(mounted.events).toStrictEqual(["open"]);
    expect(mounted.snapshots[0]).toStrictEqual({ name: "open", open: true, state: "opening" });
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    expect(mounted.events).toStrictEqual(["open"]);

    await userEvent.click(page.elementLocator(mounted.dialog().querySelector(".modal-close")!));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    expect(mounted.events).toStrictEqual(["open"]);

    finishAnimations();
    await expect.poll(() => mounted.dialog().open).toBe(false);
    expect(mounted.events).toStrictEqual(["open", "close"]);
    expect(mounted.snapshots[1]!.open).toBe(false);
  });

  it("emits close only after the closing animation, not when the close is asked for", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    mounted.instance.value!.close();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    await nextTick();
    expect(cssAnimations(mounted.dialog()).length).toBeGreaterThan(0);
    expect(mounted.events).toStrictEqual(["open"]);

    finishAnimations();
    await expect.poll(() => mounted.events).toStrictEqual(["open", "close"]);
    expect(mounted.snapshots[1]!.open).toBe(false);
  });

  it("closes on Escape with one close event", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    expect(mounted.events).toStrictEqual(["open"]);
    await settleClosed(mounted);

    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("closes on a click on the overlay with one close event", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    await page.elementLocator(mounted.dialog()).click({ position: { x: 20, y: 450 } });
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    await settleClosed(mounted);

    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("emits the events for the exposed methods and keeps v-model in step", async () => {
    const mounted = await mountModal();

    mounted.instance.value!.open();
    await expect.poll(() => mounted.dialog().open).toBe(true);
    expect(mounted.model.value).toBe(true);
    expect(mounted.events).toStrictEqual(["open"]);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");

    mounted.instance.value!.close();
    expect(mounted.model.value).toBe(false);
    await settleClosed(mounted);
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("emits the events for changes of v-model from the outside", async () => {
    const mounted = await mountModal();

    mounted.model.value = true;
    await expect.poll(() => mounted.dialog().open).toBe(true);
    finishAnimations();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    expect(mounted.events).toStrictEqual(["open"]);

    mounted.model.value = false;
    await settleClosed(mounted);
    expect(mounted.events).toStrictEqual(["open", "close"]);
    expect(mounted.model.value).toBe(false);
  });

  it("does not repeat open for a second open on an open window", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    mounted.instance.value!.open();
    mounted.model.value = true;
    await nextTick();
    await nextTick();

    expect(mounted.events).toStrictEqual(["open"]);
  });

  it("does not repeat close for a second close on a closing or closed window", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    mounted.instance.value!.close();
    await expect.poll(() => mounted.dialog().dataset.state).toBe("closing");
    mounted.instance.value!.close();
    await userEvent.keyboard("{Escape}");
    await settleClosed(mounted);
    mounted.instance.value!.close();
    await nextTick();

    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("emits one open and one close per cycle over several cycles", async () => {
    const mounted = await mountModal();

    await openModal(mounted);
    await closeModal(mounted);
    await openModal(mounted);
    await closeModal(mounted);

    expect(mounted.events).toStrictEqual(["open", "close", "open", "close"]);
  });

  it("emits both events in order when a close is asked for right after an open has started", async () => {
    const mounted = await mountModal();

    mounted.instance.value!.open();
    await expect.poll(() => mounted.dialog().open).toBe(true);
    mounted.instance.value!.close();
    await settleClosed(mounted);

    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("emits nothing when open and close are called within one tick", async () => {
    const mounted = await mountModal();

    mounted.instance.value!.open();
    mounted.instance.value!.close();
    await nextTick();
    await nextTick();

    expect(mounted.dialog().open).toBe(false);
    expect(mounted.events).toStrictEqual([]);
  });

  it("emits close when an open window is unmounted, once", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    mounted.screen.unmount();
    expect(mounted.events).toStrictEqual(["open", "close"]);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it("emits nothing more on unmount when the window is already closed", async () => {
    const mounted = await mountModal();
    await openModal(mounted);
    await closeModal(mounted);

    mounted.screen.unmount();
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it.each(themes)("emits the events at once under reduced motion in %s", async (theme) => {
    setTheme(theme);
    await setReducedMotion("reduce");
    const mounted = await mountModal();

    await userEvent.click(page.elementLocator(mounted.trigger()));
    await expect.poll(() => mounted.dialog().dataset.state).toBe("open");
    expect(mounted.events).toStrictEqual(["open"]);

    await userEvent.click(page.elementLocator(mounted.dialog().querySelector(".modal-close")!));
    await expect.poll(() => mounted.dialog().open).toBe(false);
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it.each(themes)("emits the same events in %s with the animation", async (theme) => {
    setTheme(theme);
    const mounted = await mountModal();

    await openModal(mounted);
    await closeModal(mounted);

    expect(mounted.events).toStrictEqual(["open", "close"]);
    expect(mounted.snapshots.map((item) => item.open)).toStrictEqual([true, false]);
  });
});

describe("window in the body", () => {
  it("puts the dialog straight under the body after the trigger", async () => {
    const mounted = await mountModal();
    const dialog = mounted.dialog();

    expect(dialog.parentElement).toBe(document.body);
    expect(document.body.lastElementChild).toBe(dialog);
    expect(dialog.closest(".ancestor")).toBeNull();
    expect(mounted.screen.container.querySelector("dialog")).toBeNull();
    expect(mounted.screen.container.contains(mounted.trigger())).toBe(true);
  });

  it("takes the attributes and the class of the parent onto the teleported dialog", async () => {
    const mounted = await mountModal({ props: {} });
    const dialog = mounted.dialog();

    expect(dialog.classList.contains("modal")).toBe(true);
    expect(dialog.getAttribute("data-state")).toBe("closed");
  });

  it("removes the dialog from the body when the component unmounts, open or not", async () => {
    const closed = await mountModal();
    closed.screen.unmount();
    expect(document.querySelector("dialog.modal")).toBeNull();

    const open = await mountModal();
    await openModal(open);
    open.screen.unmount();
    expect(document.querySelector("dialog.modal")).toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  });

  it("keeps the focus, the lock attribute and the events working from the body", async () => {
    const mounted = await mountModal();
    await openModal(mounted);

    expect(mounted.dialog().getAttribute("data-lock-scroll")).toBe("true");
    expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");
    await closeModal(mounted);
    expect(document.activeElement).toBe(mounted.trigger());
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });
});

describe("isolation from the ancestors of the trigger", () => {
  const rules = document.createElement("style");
  rules.textContent = `
    .ancestor-paused *, .ancestor-paused *::before, .ancestor-paused *::after {
      animation-play-state: paused !important;
    }
    .ancestor-no-transition *, .ancestor-no-transition *::before, .ancestor-no-transition *::after {
      transition: none !important;
    }
  `;

  beforeAll(() => {
    document.head.append(rules);
  });

  afterAll(() => {
    rules.remove();
  });

  const harmful = [
    { name: "transform", ancestor: { style: "transform: translate(37px, 53px) scale(0.5)" } },
    { name: "filter", ancestor: { style: "filter: grayscale(1) blur(2px)" } },
    { name: "contain paint", ancestor: { style: "contain: paint" } },
    {
      name: "overflow hidden in a small box",
      ancestor: { style: "overflow: hidden; width: 20px; height: 20px" },
    },
    {
      name: "isolation",
      ancestor: { style: "position: relative; isolation: isolate; z-index: 0" },
    },
    { name: "visibility hidden", ancestor: { style: "visibility: hidden" } },
    { name: "pointer-events none", ancestor: { style: "pointer-events: none" } },
    { name: "paused animations", ancestor: { attrs: { class: "ancestor-paused" } } },
    { name: "disabled transitions", ancestor: { attrs: { class: "ancestor-no-transition" } } },
    { name: "data-theme-instant", ancestor: { attrs: { "data-theme-instant": "" } } },
    {
      name: "all of them together",
      ancestor: {
        style:
          "transform: translate(37px, 53px); filter: grayscale(1); contain: paint; overflow: hidden; width: 20px; height: 20px; position: relative; isolation: isolate; z-index: 0; visibility: hidden; pointer-events: none",
        attrs: { class: "ancestor-paused ancestor-no-transition", "data-theme-instant": "" },
      },
    },
  ];

  const cases = themes.flatMap((theme) => harmful.map((item) => ({ theme, ...item })));

  const allRunning = (dialog: HTMLDialogElement) =>
    cssAnimations(dialog).every((animation) => animation.playState === "running");

  it.each(cases)("$theme runs and ends its animations under $name", async (item) => {
    setTheme(item.theme);
    const mounted = await mountModal({ ancestor: item.ancestor });
    const dialog = mounted.dialog();

    mounted.instance.value!.open();
    await expect.poll(() => dialog.dataset.state).toBe("opening");
    expect(cssAnimations(dialog).length).toBeGreaterThan(0);
    expect(allRunning(dialog)).toBe(true);

    await expect.poll(() => dialog.dataset.state, { timeout: 8000 }).toBe("open");
    const style = getComputedStyle(dialog);
    expect(style.visibility).toBe("visible");
    expect(style.pointerEvents).not.toBe("none");
    const rect = dialog.getBoundingClientRect();
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.height).toBe(window.innerHeight);
    const hit = document.elementFromPoint(rect.width / 2, rect.height / 2);
    expect(dialog.contains(hit)).toBe(true);
    expect(visible(dialog.querySelector(".modal-window")!)).toBe(true);
    expect(visible(dialog.querySelector(".modal-body")!)).toBe(true);

    mounted.instance.value!.close();
    await expect.poll(() => dialog.dataset.state).toBe("closing");
    expect(allRunning(dialog)).toBe(true);
    await expect.poll(() => dialog.open, { timeout: 8000 }).toBe(false);
    expect(mounted.events).toStrictEqual(["open", "close"]);
  });

  it.each(
    themes.flatMap((theme) =>
      harmful
        .filter((item) =>
          ["disabled transitions", "data-theme-instant", "all of them together"].includes(
            item.name,
          ),
        )
        .map((item) => ({ theme, ...item })),
    ),
  )("$theme still transitions on a theme switch under $name", async (item) => {
    setTheme(item.theme);
    const mounted = await mountModal({ ancestor: item.ancestor });
    const dialog = mounted.dialog();

    mounted.instance.value!.open();
    await expect.poll(() => dialog.dataset.state, { timeout: 8000 }).toBe("open");
    dialog.getBoundingClientRect();
    setTheme(item.theme === "torii-synth" ? "cyber-sakura" : "torii-synth");

    expect(transitioning(dialog.querySelector(".modal-window")!, "width")).toBe(true);
    expect(transitioning(dialog.querySelector(".modal-title")!, "text-shadow")).toBe(true);
    expect(transitioning(dialog.querySelector(".modal-close")!, "width")).toBe(true);
  });

  it("does not mark the window as instant when the real theme toggle freezes hidden elements", async () => {
    const actual =
      await vi.importActual<typeof import("~/composables/useTheme")>("~/composables/useTheme");
    setTheme("torii-synth");
    const mounted = await mountModal({ tall: true });
    await openModal(mounted);
    const dialog = mounted.dialog();

    actual.useTheme().toggle();
    const marked = [...dialog.querySelectorAll("[data-theme-instant]")].map(
      (element) => element.className,
    );

    expect(dialog.hasAttribute("data-theme-instant")).toBe(false);
    for (const name of ["modal-screen", "modal-window", "modal-box", "modal-inner", "modal-body"]) {
      expect(dialog.querySelector(`.${name}`)!.closest("[data-theme-instant]")).toBeNull();
    }
    expect(
      marked.filter((name) => /modal-(close|title|label|bar)/.test(String(name))),
    ).toStrictEqual([]);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setTheme("torii-synth");
  });
});
