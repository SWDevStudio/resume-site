import { h, type VNode } from "vue";
import { render } from "vitest-browser-vue";
import { afterEach, describe, expect, it } from "vitest";
import UiButton from "~/components/ui/UiButton/UiButton.vue";
import UiCardMedia from "~/components/ui/card/UiCardMedia/UiCardMedia.vue";
import qwixit from "~/components/ui/card/UiCardMedia/media/qwixit.svg";
import {
  describeHover,
  describeScreenshots,
  describeThemeSwitch,
  finishAnimations,
  loadCardFonts,
  renderCard,
  themes,
  type CardCase,
} from "~/components/ui/card/testing";
import type { FolderData } from "~/components/ui/card/types";
import UiFolder from "./UiFolder.vue";

const tags = ["E-commerce", "Full-Stack", "Payments"];

const codeIcon = () =>
  h(
    "svg",
    {
      class: "h-3.25 w-4 text-primary-ink",
      viewBox: "0 0 18 14",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
    },
    h("path", { d: "M5 2L1 7L5 12M13 2L17 7L13 12M10.5 1L7.5 13" }),
  );

const folder = (shot?: () => VNode) =>
  h(
    UiFolder,
    {
      class: "min-h-142.5",
      data: {
        index: "01",
        title: "Qwixit",
        subtitle: "FASHION MARKETPLACE · US DELIVERY",
        text: "E-commerce platform for clothing, footwear and accessories from global brands.",
        tags,
        image: shot ? undefined : qwixit,
        imageAlt: "Qwixit",
      },
    },
    {
      media: shot,
      actions: () => [
        h("a", { class: "btn btn-link", href: "#" }, ["Read case", codeIcon()]),
        h(UiButton, { class: "btn-primary btn-sm", type: "button" }, () => "LIVE SITE"),
      ],
    },
  );

const cases: CardCase[] = [{ name: "folder", wrapper: "w-91.25", view: () => folder() }];

const solidShot = () => h(UiCardMedia, null, () => h("div", { class: "size-full bg-base-300" }));

const switchCases: CardCase[] = [
  { name: "folder", wrapper: "w-91.25", view: () => folder(solidShot) },
];

loadCardFonts();

describeScreenshots(cases);

describeHover(".folder", cases);

describe.each(themes)("focus %s", (theme) => {
  afterEach(() => {
    finishAnimations();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it("highlights the frame while a control inside is focused", async () => {
    document.documentElement.dataset.theme = theme;
    const screen = await renderCard(cases[0]!);
    const card = screen.container.querySelector<HTMLElement>(".folder")!;
    const frame = card.querySelector<HTMLElement>(".card-frame")!;
    const restLine = getComputedStyle(frame, "::before").backgroundColor;

    card.querySelector<HTMLElement>("button")!.focus();
    await expect.poll(() => document.getAnimations().length).toBeGreaterThan(0);
    finishAnimations();

    expect(getComputedStyle(frame, "::before").backgroundColor).not.toBe(restLine);
  });
});

describeThemeSwitch(switchCases);

describe("data", () => {
  const blocks = [
    ".card-head",
    ".card-title",
    ".card-index",
    ".card-subtitle",
    ".card-text",
    ".card-tags",
    ".card-media",
    ".folder-actions",
  ];

  const mount = async (
    data: FolderData,
    slots: Record<string, () => unknown> = {},
    attrs: Record<string, unknown> = {},
  ) => (await render(() => h(UiFolder, { ...attrs, data }, slots))).container;

  it("renders no content blocks with empty data and no slots", async () => {
    const container = await mount({});

    for (const selector of blocks) expect(container.querySelector(selector)).toBeNull();
    expect(container.querySelector(".card-frame")).not.toBeNull();
  });

  it.each([
    ["title", ".card-title", "Qwixit"],
    ["subtitle", ".card-subtitle", "FASHION MARKETPLACE"],
    ["text", ".card-text", "Some text"],
  ])("renders %s only when it is in data", async (prop, selector, value) => {
    const container = await mount({ [prop]: value });

    expect(container.querySelector(selector)?.textContent?.trim()).toBe(value);
    expect(container.querySelector(".card-body")!.children).toHaveLength(1);
  });

  it("renders the index inside the title", async () => {
    const container = await mount({ index: "01", title: "Qwixit" });

    expect(container.querySelector(".card-title .card-index")?.textContent).toBe("01");
  });

  it("renders the index only together with a title", async () => {
    const container = await mount({ index: "01" });

    expect(container.querySelector(".card-index")).toBeNull();
    expect(container.querySelector(".card-head")).toBeNull();
  });

  it("renders as many tags as there are in the array", async () => {
    const container = await mount({ tags });

    expect(container.querySelectorAll(".card-tags .card-tag")).toHaveLength(tags.length);
    expect(
      Array.from(container.querySelectorAll(".card-tag"), (tag) => tag.textContent),
    ).toStrictEqual(tags);
  });

  it("renders no tag block for an empty array", async () => {
    const container = await mount({ tags: [] });

    expect(container.querySelector(".card-tags")).toBeNull();
  });

  it("renders an image with alt text", async () => {
    const container = await mount({ image: qwixit, imageAlt: "Qwixit" });
    const image = container.querySelector<HTMLImageElement>(".card-media img")!;

    expect(image).not.toBeNull();
    expect(image.getAttribute("alt")).toBe("Qwixit");
    expect(image.getAttribute("src")).toBe(qwixit);
  });

  it("renders no image block without an image", async () => {
    const container = await mount({ imageAlt: "Qwixit" });

    expect(container.querySelector(".card-media")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("replaces the image with the media slot", async () => {
    const container = await mount(
      { image: qwixit },
      { media: () => h("div", { class: "custom-media" }) },
    );

    expect(container.querySelector(".custom-media")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("wraps the actions slot in folder-actions", async () => {
    const container = await mount({}, { actions: () => h("button", { type: "button" }, "Go") });

    expect(container.querySelector(".folder-actions button")?.textContent).toBe("Go");
  });

  it("keeps the order of blocks", async () => {
    const container = await mount(
      { index: "01", title: "T", subtitle: "S", text: "X", tags, image: qwixit },
      { actions: () => h("b") },
    );
    const order = Array.from(
      container.querySelector(".card-body")!.children,
      (element) => element.className.split(" ")[0],
    );

    expect(order).toStrictEqual([
      "card-head",
      "card-text",
      "card-tags",
      "card-media",
      "folder-actions",
    ]);
  });

  it("is a single root that takes the class and attributes", async () => {
    const container = await mount({ title: "T" }, {}, { class: "min-h-20", "data-test": "x" });
    const root = container.querySelector(".folder")!;

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(root);
    expect(root.classList.contains("min-h-20")).toBe(true);
    expect(root.getAttribute("data-test")).toBe("x");
  });

  it("does not leak data into the root attributes", async () => {
    const container = await mount({ index: "01", title: "T", text: "X", tags });
    const root = container.querySelector(".folder")!;

    expect(root.hasAttribute("data")).toBe(false);
    expect(root.getAttributeNames()).toStrictEqual(["class"]);
  });

  it("renders no title and no text for empty data", async () => {
    const container = await mount({});

    expect(container.querySelector(".card-title")).toBeNull();
    expect(container.querySelector(".card-text")).toBeNull();
    expect(container.querySelector(".card-body")!.children).toHaveLength(0);
  });

  it("renders no tag block when tags are omitted", async () => {
    const container = await mount({ title: "T" });

    expect(container.querySelector(".card-tags")).toBeNull();
  });

  it("renders an empty alt when imageAlt is omitted", async () => {
    const container = await mount({ image: qwixit });

    expect(container.querySelector(".card-media img")!.getAttribute("alt")).toBe("");
  });
});
