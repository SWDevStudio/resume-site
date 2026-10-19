import { h } from "vue";
import { render } from "vitest-browser-vue";
import { describe, expect, it } from "vitest";
import UiSkillTile from "~/components/ui/UiSkillTile/UiSkillTile.vue";
import { SkillTile } from "~/components/ui/UiSkillTile/skillTile";
import {
  describeHover,
  describeScreenshots,
  describeThemeSwitch,
  loadCardFonts,
  type CardCase,
} from "~/components/ui/card/testing";
import type { PanelData } from "~/components/ui/card/types";
import UiPanel from "./UiPanel.vue";

const panel = () =>
  h(
    UiPanel,
    { data: { index: "01", title: "Frontend" } },
    {
      default: () => [
        h(UiSkillTile, { skillName: SkillTile.React }),
        h(UiSkillTile, { skillName: SkillTile.NextJs }),
        h(UiSkillTile, { skillName: SkillTile.Vue }),
      ],
    },
  );

const cases: CardCase[] = [{ name: "panel", wrapper: "w-101", view: panel }];

loadCardFonts();

describeScreenshots(cases);

describeHover(".panel", cases);

describeThemeSwitch(cases);

describe("data", () => {
  const blocks = [".card-head", ".card-title", ".card-index", ".panel-content"];

  const mount = async (
    data: PanelData,
    slots: Record<string, () => unknown> = {},
    attrs: Record<string, unknown> = {},
  ) => (await render(() => h(UiPanel, { ...attrs, data }, slots))).container;

  it("renders no content blocks with empty data and no slots", async () => {
    const container = await mount({});

    for (const selector of blocks) expect(container.querySelector(selector)).toBeNull();
    expect(container.querySelector(".card-frame")).not.toBeNull();
  });

  it("renders the title only when it is in data", async () => {
    const container = await mount({ title: "Frontend" });

    expect(container.querySelector(".card-title")?.textContent?.trim()).toBe("Frontend");
    expect(container.querySelector(".card-body")!.children).toHaveLength(1);
  });

  it("renders the index inside the title", async () => {
    const container = await mount({ index: "01", title: "Frontend" });

    expect(container.querySelector(".card-title .card-index")?.textContent).toBe("01");
  });

  it("renders the index only together with a title", async () => {
    const container = await mount({ index: "01" });

    expect(container.querySelector(".card-index")).toBeNull();
    expect(container.querySelector(".card-head")).toBeNull();
  });

  it("wraps the default slot in panel-content", async () => {
    const container = await mount({}, { default: () => h("span", { class: "free" }, "Free") });

    expect(container.querySelector(".panel-content .free")).not.toBeNull();
  });

  it("keeps the order of blocks", async () => {
    const container = await mount({ index: "01", title: "T" }, { default: () => h("i") });
    const order = Array.from(
      container.querySelector(".card-body")!.children,
      (element) => element.className.split(" ")[0],
    );

    expect(order).toStrictEqual(["card-head", "panel-content"]);
  });

  it("is a single root that takes the class and attributes", async () => {
    const container = await mount({ title: "T" }, {}, { class: "min-h-20", "data-test": "x" });
    const root = container.querySelector(".panel")!;

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(root);
    expect(root.classList.contains("min-h-20")).toBe(true);
    expect(root.getAttribute("data-test")).toBe("x");
  });

  it("does not leak data into the root attributes", async () => {
    const container = await mount({ index: "01", title: "T" });
    const root = container.querySelector(".panel")!;

    expect(root.hasAttribute("data")).toBe(false);
    expect(root.getAttributeNames()).toStrictEqual(["class"]);
  });

  it("renders no title for empty data", async () => {
    const container = await mount({});

    expect(container.querySelector(".card-title")).toBeNull();
    expect(container.querySelector(".card-body")!.children).toHaveLength(0);
  });
});
