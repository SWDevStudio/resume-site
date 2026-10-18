import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "~/assets/css/main.css";

interface ContainerCase {
  width: number;
  height: number;
  rem: number;
  padding: number;
}

const initial = { width: 0, height: 0 };

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const cases: ContainerCase[] = [
  { width: 400, height: 800, rem: 16, padding: 5 },
  { width: 800, height: 600, rem: 16, padding: 8 },
  { width: 1024, height: 768, rem: 16, padding: 10 },
  { width: 1440, height: 900, rem: 16, padding: 10 },
  { width: 1920, height: 1080, rem: 19.2, padding: 10 },
  { width: 2560, height: 1440, rem: 25.6, padding: 10 },
];

const variants = [
  { name: "container", class: "container", max: 77.5 },
  { name: "container-wide", class: "container container-wide", max: 80 },
];

beforeAll(() => {
  initial.width = window.innerWidth;
  initial.height = window.innerHeight;
});

afterAll(async () => {
  await page.viewport(initial.width, initial.height);
});

describe.each(variants)("$name", (variant) => {
  it.each(cases)("$width x $height", async ({ width, height, rem, padding }) => {
    await page.viewport(width, height);
    await frame();
    const screen = await render(() => h("div", { class: variant.class }, "Content"));
    const element = screen.container.firstElementChild as HTMLElement;
    const style = getComputedStyle(element);
    const maxWidth = variant.max * rem;

    expect(Number.parseFloat(style.maxWidth)).toBeCloseTo(maxWidth, 1);
    expect(Number.parseFloat(style.paddingLeft)).toBeCloseTo(padding * 0.25 * rem, 1);
    expect(Number.parseFloat(style.paddingRight)).toBeCloseTo(padding * 0.25 * rem, 1);
    expect(style.marginLeft).toBe(style.marginRight);
    expect(style.containerType).toBe("normal");

    const available = element.parentElement!.clientWidth;
    expect(element.getBoundingClientRect().width).toBeCloseTo(Math.min(available, maxWidth), 1);
  });
});
