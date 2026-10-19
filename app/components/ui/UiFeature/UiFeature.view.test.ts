import { h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  animationsIn,
  describeHover,
  describeScreenshots,
  describeThemeSwitch,
  loadCardFonts,
  renderCard,
  setReducedMotion,
  type CardCase,
} from "~/components/ui/card/testing";
import type { FeatureData } from "~/components/ui/card/types";
import UiFeature from "./UiFeature.vue";

const feature = () =>
  h(UiFeature, {
    data: {
      label: "michael.dev",
      prompt:
        "I build digital products end to end with my own hands and ship them around their competitive advantages.",
    },
  });

const cases: CardCase[] = [{ name: "feature", wrapper: "w-101", view: feature }];

loadCardFonts();

describeScreenshots(cases);

describeHover(".feature-box", cases);

describe("reduced motion", () => {
  beforeEach(async () => {
    document.documentElement.dataset.theme = "torii-synth";
    await setReducedMotion("reduce");
  });

  afterEach(async () => {
    await userEvent.unhover(page.elementLocator(document.body));
    await setReducedMotion("no-preference");
  });

  it("highlights the frame on hover without transitions", async () => {
    const screen = await renderCard(cases[0]!);
    const card = screen.container.querySelector<HTMLElement>(".feature-box")!;
    const frame = card.querySelector<HTMLElement>(".card-frame")!;
    const restGlow = getComputedStyle(frame).filter;

    await userEvent.hover(page.elementLocator(card));

    expect(animationsIn(screen.container)).toHaveLength(0);
    expect(getComputedStyle(frame).filter).not.toBe(restGlow);
  });
});

describeThemeSwitch(cases);

describe("data", () => {
  const blocks = [".card-head", ".card-title", ".card-index", ".feature-label", ".feature-prompt"];

  const mount = async (data: FeatureData, attrs: Record<string, unknown> = {}) =>
    (await render(() => h(UiFeature, { ...attrs, data }))).container;

  it("renders no content blocks with empty data", async () => {
    const container = await mount({});

    for (const selector of blocks) expect(container.querySelector(selector)).toBeNull();
    expect(container.querySelector(".card-frame")).not.toBeNull();
  });

  it.each([
    ["label", ".feature-label", "michael.dev"],
    ["prompt", ".feature-prompt", "Some prompt"],
  ])("renders %s only when it is in data", async (prop, selector, value) => {
    const container = await mount({ [prop]: value });

    expect(container.querySelector(selector)?.textContent?.trim()).toBe(value);
    expect(container.querySelector(".card-body")!.children).toHaveLength(1);
    expect(container.querySelector(".card-head")).toBeNull();
  });

  it("renders the title above the box and the index inside the title", async () => {
    const container = await mount({ index: "01", title: "Autonomy", label: "michael.dev" });
    const box = container.querySelector(".feature-box")!;
    const head = container.querySelector(".card-head")!;

    expect(head.querySelector(".card-title .card-index")?.textContent).toBe("01");
    expect(box.contains(head)).toBe(false);
    expect(head.nextElementSibling).toBe(box);
    expect(box.querySelector(".feature-label")).not.toBeNull();
  });

  it("renders the index only together with a title", async () => {
    const container = await mount({ index: "01" });

    expect(container.querySelector(".card-index")).toBeNull();
    expect(container.querySelector(".card-head")).toBeNull();
  });

  it("is a single root that takes the class and attributes", async () => {
    const container = await mount({ title: "T" }, { class: "min-h-20", "data-test": "x" });
    const root = container.querySelector(".feature")!;

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(root);
    expect(root.classList.contains("min-h-20")).toBe(true);
    expect(root.getAttribute("data-test")).toBe("x");
    expect(root.querySelector(".feature-box")!.getAttribute("data-test")).toBeNull();
  });

  it("does not leak data into the root attributes", async () => {
    const container = await mount({ index: "01", title: "T", label: "L", prompt: "P" });
    const root = container.querySelector(".feature")!;

    expect(root.hasAttribute("data")).toBe(false);
    expect(root.getAttributeNames()).toStrictEqual(["class"]);
  });

  it("renders no title, label and prompt for empty data", async () => {
    const container = await mount({});

    expect(container.querySelector(".card-title")).toBeNull();
    expect(container.querySelector(".feature-label")).toBeNull();
    expect(container.querySelector(".feature-prompt")).toBeNull();
    expect(container.querySelector(".card-body")!.children).toHaveLength(0);
  });
});
