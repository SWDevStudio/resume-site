import { defineComponent, h, nextTick } from "vue";
import { render } from "vitest-browser-vue";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "./useTheme";
import "~/assets/css/main.css";

const Probe = defineComponent({
  setup() {
    const { toggle } = useTheme();
    return () =>
      h("div", [
        h("button", { class: "toggle", onClick: toggle }),
        h("section", { id: "near", style: "height: 200px" }, [h("p", { class: "child" }, "near")]),
        h("section", { id: "far", style: "margin-top: 3000px; height: 200px" }, [
          h("p", { class: "child" }, "far"),
        ]),
      ]);
  },
});

async function mount() {
  const screen = await render(Probe);
  const root = screen.container;
  return {
    toggle: () => root.querySelector<HTMLElement>(".toggle")!.click(),
    near: root.querySelector<HTMLElement>("#near")!,
    far: root.querySelector<HTMLElement>("#far")!,
  };
}

beforeEach(() => {
  localStorage.removeItem("vueuse-color-scheme");
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  localStorage.removeItem("vueuse-color-scheme");
  delete document.documentElement.dataset.theme;
});

describe("theme switch", () => {
  it("turns transitions off in the elements outside the screen", async () => {
    const { toggle, near, far } = await mount();

    toggle();

    expect(far.hasAttribute("data-theme-instant")).toBe(true);
    expect(near.hasAttribute("data-theme-instant")).toBe(false);
    expect(getComputedStyle(far.querySelector(".child")!).transitionProperty).toBe("none");
    expect(getComputedStyle(near.querySelector(".child")!).transitionProperty).not.toBe("none");
  });

  it("marks only the topmost element outside the screen", async () => {
    const { toggle, far } = await mount();

    toggle();

    expect(far.querySelector(".child")!.hasAttribute("data-theme-instant")).toBe(false);
  });

  it("starts no transitions in the elements outside the screen", async () => {
    const { toggle, far } = await mount();

    toggle();
    await expect.poll(() => document.documentElement.dataset.theme).toBeTruthy();

    expect(far.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it("gives the transitions back once the switch has settled", async () => {
    const { toggle, far } = await mount();

    toggle();
    await expect.poll(() => far.hasAttribute("data-theme-instant"), { timeout: 3000 }).toBe(false);

    expect(getComputedStyle(far.querySelector(".child")!).transitionProperty).not.toBe("none");
  });
});

describe("shared state", () => {
  it("gives every caller the same state", async () => {
    const modes: unknown[] = [];
    const Caller = defineComponent({
      setup() {
        modes.push(useTheme().mode);
        return () => null;
      },
    });
    await render(() => h("div", [h(Caller), h(Caller), h(Caller)]));

    expect(modes).toHaveLength(3);
    expect(modes[1]).toBe(modes[0]);
    expect(modes[2]).toBe(modes[0]);
  });

  it("gives every caller the same current theme after a toggle", async () => {
    const Reader = defineComponent({
      setup() {
        const { current } = useTheme();
        return () => h("output", { class: "reader" }, current.value);
      },
    });
    const screen = await render(() => h("div", [h(Probe), h(Reader)]));
    const reader = screen.container.querySelector<HTMLElement>(".reader")!;
    const before = reader.textContent;

    screen.container.querySelector<HTMLElement>(".toggle")!.click();
    await nextTick();

    expect(reader.textContent).not.toBe(before);
    expect(reader.textContent).toBe(document.documentElement.dataset.theme);
  });
});
