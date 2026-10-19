import { h } from "vue";
import { render } from "vitest-browser-vue";
import { describe, expect, it } from "vitest";
import { describeScreenshots, loadCardFonts, type CardCase } from "~/components/ui/card/testing";
import UiCardMedia from "./UiCardMedia.vue";
import qwixit from "./media/qwixit.svg";

const cases: CardCase[] = [
  {
    name: "media",
    wrapper: "w-78.25",
    view: () => h(UiCardMedia, { src: qwixit, alt: "Qwixit" }),
  },
];

loadCardFonts();

describeScreenshots(cases);

describe("props", () => {
  it("renders an image with alt text", async () => {
    const container = (await render(() => h(UiCardMedia, { src: qwixit, alt: "Qwixit" })))
      .container;
    const image = container.querySelector<HTMLImageElement>(".card-media img")!;

    expect(image.getAttribute("alt")).toBe("Qwixit");
    expect(image.getAttribute("src")).toBe(qwixit);
  });

  it("renders no image without src and keeps the slot", async () => {
    const container = (
      await render(() => h(UiCardMedia, null, () => h("div", { class: "custom" })))
    ).container;

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".card-media .custom")).not.toBeNull();
  });
});
