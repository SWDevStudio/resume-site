import { h, type VNodeChild } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Route } from "~/assets/const";
import UiButton from "./UiButton.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface ButtonCase {
  name: string;
  class?: string;
  disabled?: boolean;
  wrapper?: string;
  slot?: () => VNodeChild;
}

const themes = ["torii-synth", "cyber-sakura"];

const githubIcon = () =>
  h(
    "svg",
    {
      class: "size-5.5",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
    },
    h("path", {
      d: "M4 9V20M4 4.5V5M9 20V9M9 13.5C9 11 10.5 9 13 9C15.5 9 16 11 16 13V20M20 20V13",
    }),
  );

const cases: ButtonCase[] = [
  { name: "btn" },
  { name: "btn-primary", class: "btn-primary" },
  { name: "btn-secondary", class: "btn-secondary" },
  { name: "btn-accent", class: "btn-accent" },
  { name: "btn-xs", class: "btn-xs" },
  { name: "btn-sm", class: "btn-sm" },
  { name: "btn-md", class: "btn-md" },
  { name: "btn-lg", class: "btn-lg" },
  { name: "btn-xl", class: "btn-xl" },
  { name: "disabled", disabled: true },
  { name: "btn-disabled", class: "btn-primary btn-disabled" },
  { name: "btn-ghost", class: "btn-ghost" },
  { name: "btn-link", class: "btn-link" },
  { name: "btn-square", class: "btn-square", slot: githubIcon },
  { name: "btn-block", class: "btn-primary btn-block", wrapper: "w-96" },
  { name: "btn-gradient", class: "btn-gradient btn-block", wrapper: "w-96" },
];

beforeAll(async () => {
  await document.fonts.load('1em "Martian Mono"');
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await render(() =>
      h(
        "div",
        { class: ["inline-block bg-base-100 p-4", item.wrapper] },
        h(
          UiButton,
          { class: item.class, disabled: item.disabled },
          item.slot ?? (() => "Projects"),
        ),
      ),
    );

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("element", () => {
  async function renderButton(props: Record<string, unknown>) {
    const screen = await render(() => h(UiButton, props, () => "Projects"));
    return screen.container.firstElementChild!;
  }

  it("renders a button without href and to", async () => {
    const root = await renderButton({});

    expect(root.tagName).toBe("BUTTON");
    expect(root.classList.contains("btn")).toBe(true);
    expect(root.hasAttribute("href")).toBe(false);
    expect(root.hasAttribute("type")).toBe(false);
    expect(root.hasAttribute("rel")).toBe(false);
    expect(root.hasAttribute("target")).toBe(false);
  });

  it("keeps the frame layer and the slot in every mode", async () => {
    const roots = [
      await renderButton({}),
      await renderButton({ href: "https://example.com" }),
      await renderButton({ href: null }),
      await renderButton({ to: "/projects" }),
    ];

    for (const root of roots) {
      expect(root.classList.contains("btn")).toBe(true);
      expect(root.firstElementChild!.classList.contains("btn-frame")).toBe(true);
      expect(root.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
      expect(root.textContent).toBe("Projects");
    }
  });

  it("passes attributes of a button to the root", async () => {
    const root = await renderButton({ type: "button", disabled: true, class: "btn-primary" });

    expect(root.tagName).toBe("BUTTON");
    expect(root.getAttribute("type")).toBe("button");
    expect(root.hasAttribute("disabled")).toBe(true);
    expect(root.classList.contains("btn-primary")).toBe(true);
  });

  it("renders a link with the href", async () => {
    const root = await renderButton({
      href: "https://example.com",
      "aria-label": "Open example",
      download: "",
      class: "btn-primary",
    });

    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("https://example.com");
    expect(root.getAttribute("aria-label")).toBe("Open example");
    expect(root.hasAttribute("download")).toBe(true);
    expect(root.classList.contains("btn")).toBe(true);
    expect(root.classList.contains("btn-primary")).toBe(true);
  });

  it("renders a link without the href when href is null", async () => {
    const root = await renderButton({ href: null, "aria-disabled": "true" });

    expect(root.tagName).toBe("A");
    expect(root.hasAttribute("href")).toBe(false);
    expect(root.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders the router link when to is set", async () => {
    const root = await renderButton({ to: "/projects", class: "btn-md" });

    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("/projects");
    expect(root.classList.contains("btn")).toBe(true);
    expect(root.classList.contains("btn-md")).toBe(true);
  });

  it("accepts the string routes of Route", async () => {
    const root = await renderButton({ to: Route.project("qwixit") });

    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("/projects/qwixit");
  });

  it("accepts the path and hash routes of Route", async () => {
    const root = await renderButton({ to: Route.about });

    expect(root.tagName).toBe("A");
    expect(root.getAttribute("href")).toBe("/#about");
  });

  it("prefers to over href", async () => {
    const root = await renderButton({ to: "/projects", href: "https://example.com" });

    expect(root.getAttribute("href")).toBe("/projects");
  });

  it("adds a safe rel to a link that opens a new tab", async () => {
    const link = await renderButton({ href: "https://example.com", target: "_blank" });
    const routed = await renderButton({ to: "/projects", target: "_blank" });

    for (const root of [link, routed]) {
      expect(root.getAttribute("target")).toBe("_blank");
      expect(root.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("keeps the rel that was passed", async () => {
    const root = await renderButton({
      href: "https://example.com",
      target: "_blank",
      rel: "noopener",
    });

    expect(root.getAttribute("rel")).toBe("noopener");
  });

  it("does not add rel to a link in the same tab", async () => {
    const root = await renderButton({ href: "https://example.com" });

    expect(root.hasAttribute("rel")).toBe(false);
    expect(root.hasAttribute("target")).toBe(false);
  });
});
