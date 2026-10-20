import { page } from "vitest/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "~/assets/css/main.css";

const initial = { width: 0, height: 0 };

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function setViewport(width: number, height: number) {
  await page.viewport(width, height);
  await frame();
}

const rootSize = () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

const sizes = [
  { width: 1024, height: 768, rem: 16 },
  { width: 1280, height: 720, rem: 16 },
  { width: 1440, height: 900, rem: 16 },
  { width: 1920, height: 1080, rem: 19.2 },
  { width: 2560, height: 1440, rem: 25.6 },
  { width: 2560, height: 1600, rem: 28.444 },
  { width: 3440, height: 1440, rem: 25.6 },
  { width: 3840, height: 2160, rem: 28.444 },
];

beforeAll(() => {
  initial.width = window.innerWidth;
  initial.height = window.innerHeight;
});

afterAll(async () => {
  await setViewport(initial.width, initial.height);
});

describe("root font size", () => {
  it.each(sizes)("$width x $height", async ({ width, height, rem }) => {
    await setViewport(width, height);

    expect(rootSize()).toBeCloseTo(rem, 2);
  });
});

describe("rem in conditions", () => {
  let style: HTMLStyleElement;
  let box: HTMLElement;

  const color = () => getComputedStyle(box.firstElementChild!).color;

  beforeAll(() => {
    style = document.createElement("style");
    style.textContent = `
      .q { container-type: inline-size; width: 1000px; }
      .q > .c { color: rgb(1, 1, 1); }
      .q > .m { color: rgb(1, 1, 1); }
      @container (width >= 40rem) { .q > .c { color: rgb(0, 0, 255); } }
      @media (width >= 100rem) { .q > .m { color: rgb(0, 0, 255); } }
    `;
    document.head.append(style);
  });

  afterEach(() => {
    box.remove();
  });

  afterAll(() => {
    style.remove();
  });

  function mount(kind: "c" | "m") {
    box = document.createElement("div");
    box.className = "q";
    const child = document.createElement("div");
    child.className = kind;
    box.append(child);
    document.body.append(box);
  }

  it("container query rem follows the scaled root at 1440x900", async () => {
    await setViewport(1440, 900);
    mount("c");

    expect(rootSize()).toBe(16);
    expect(color()).toBe("rgb(0, 0, 255)");
  });

  it("container query rem follows the scaled root at 2560x1600", async () => {
    await setViewport(2560, 1600);
    mount("c");

    expect(rootSize()).toBeCloseTo(28.444, 2);
    expect(color()).toBe("rgb(1, 1, 1)");
  });

  it("media query rem stays at the initial size at 1440x900", async () => {
    await setViewport(1440, 900);
    mount("m");

    expect(color()).toBe("rgb(1, 1, 1)");
  });

  it("media query rem stays at the initial size at 2560x1600", async () => {
    await setViewport(2560, 1600);
    mount("m");

    expect(color()).toBe("rgb(0, 0, 255)");
  });
});

describe("caret", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete document.documentElement.dataset.theme;
  });

  function field(tag: string, className = "") {
    const element = document.createElement(tag);
    element.className = className;
    document.body.append(element);
    return element;
  }

  function primary() {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-primary)";
    document.body.append(probe);
    return getComputedStyle(probe).color;
  }

  it.each([
    { tag: "input", className: "input" },
    { tag: "textarea", className: "textarea" },
    { tag: "input", className: "input-caret" },
  ])("is a block in the primary colour in $tag.$className", ({ tag, className }) => {
    document.documentElement.dataset.theme = "torii-synth";
    const style = getComputedStyle(field(tag, className));

    expect(style.caretShape).toBe("block");
    expect(style.caretColor).toBe(primary());
  });

  it("follows the theme", () => {
    document.documentElement.dataset.theme = "cyber-sakura";

    expect(getComputedStyle(field("input", "input")).caretColor).toBe(primary());
  });

  it.each(["input", "textarea"])("leaves a bare %s with the default caret", (tag) => {
    document.documentElement.dataset.theme = "torii-synth";
    const style = getComputedStyle(field(tag));

    expect(style.caretShape).toBe("auto");
    expect(style.caretColor).not.toBe(primary());
  });
});

describe("scroll lock", () => {
  let tall: HTMLElement;

  beforeAll(() => {
    tall = document.createElement("div");
    tall.style.height = "3000px";
    document.body.append(tall);
  });

  afterEach(() => {
    for (const element of document.querySelectorAll("[data-lock-scroll]")) element.remove();
  });

  afterAll(() => {
    tall.remove();
  });

  const root = () => getComputedStyle(document.documentElement);

  function overlay(value: string) {
    const element = document.createElement("div");
    element.dataset.lockScroll = value;
    document.body.append(element);
    return element;
  }

  it("is off without a marked element", () => {
    expect(root().overflow).not.toBe("hidden");
    expect(root().scrollbarGutter).toBe("auto");
  });

  it("hides the page overflow and keeps the scrollbar gutter while an element is marked", () => {
    const element = overlay("true");

    expect(root().overflow).toBe("hidden");
    expect(root().scrollbarGutter).toBe("stable");

    element.remove();
    expect(root().overflow).not.toBe("hidden");
    expect(root().scrollbarGutter).toBe("auto");
  });

  it("stays locked until the last marked element is gone", () => {
    const first = overlay("true");
    const second = overlay("true");

    first.remove();
    expect(root().overflow).toBe("hidden");
    second.remove();
    expect(root().overflow).not.toBe("hidden");
  });

  it("ignores an element marked with another value", () => {
    overlay("false");

    expect(root().overflow).not.toBe("hidden");
  });
});
