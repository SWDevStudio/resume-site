import { h } from "vue";
import { render } from "vitest-browser-vue";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEMES } from "~/assets/const";
import { UI_ICONS, type UiIconName } from "./icons";
import UiIcon from "./UiIcon.vue";
import "~/assets/css/main.css";

async function icon(name: UiIconName) {
  const screen = await render(() => h(UiIcon, { name, style: "width: 16px; height: 16px" }));
  return screen.container.querySelector<HTMLElement>(".ui-icon")!;
}

function url(element: HTMLElement, theme: string) {
  return element.style.getPropertyValue(`--ui-icon-${theme}`);
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("UiIcon", () => {
  it("lists every icon of the packs", () => {
    const files = Object.keys(import.meta.glob("./packs/*/*.svg"));
    const pack = (theme: string) =>
      files
        .filter((file) => file.startsWith(`./packs/${theme}/`))
        .map((file) => file.slice(file.lastIndexOf("/") + 1, -".svg".length))
        .sort();

    expect(pack(DEFAULT_THEME)).toEqual([...UI_ICONS].sort());
    for (const theme of THEMES) {
      for (const name of pack(theme)) expect(UI_ICONS).toContain(name);
    }
  });

  it("hides itself from assistive technology", async () => {
    const element = await icon("arrow-right");

    expect(element.tagName).toBe("SPAN");
    expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  it("takes the icon from the pack of each theme", async () => {
    const element = await icon("arrow-right");

    expect(url(element, "torii-synth")).toMatch(/^url\(".+"\)$/);
    expect(url(element, "cyber-sakura")).toMatch(/^url\(".+"\)$/);
    expect(url(element, "cyber-sakura")).not.toBe(url(element, "torii-synth"));
  });

  it("falls back to the default pack when a theme has no such icon", async () => {
    const element = await icon("arrow-down");

    expect(url(element, "cyber-sakura")).toBe(url(element, "torii-synth"));
  });

  it.each(["torii-synth", "cyber-sakura"])("masks with the pack of the %s theme", async (theme) => {
    document.documentElement.dataset.theme = theme;
    const element = await icon("arrow-right");

    expect(getComputedStyle(element).maskImage).toBe(url(element, theme));
  });

  it("paints with the current text colour", async () => {
    const element = await icon("arrow-right");
    element.style.color = "rgb(255, 0, 0)";

    expect(getComputedStyle(element).backgroundColor).toBe("rgb(255, 0, 0)");
  });
});
