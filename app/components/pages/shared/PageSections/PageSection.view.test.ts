import { h, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import PageSection from "./PageSection.vue";
import PageSections from "./PageSections.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

type Props = Record<string, unknown>;
type Slots = Record<string, () => unknown>;

async function renderSections(
  sections: {
    props: Props;
    slots?: Slots;
  }[],
) {
  await page.viewport(1440, 900);
  document.documentElement.lang = "en";
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        h(
          PageSections,
          { navTitle: "On this page" },
          {
            default: () =>
              sections.map((section, index) =>
                h(
                  PageSection,
                  { key: index, ...section.props },
                  { default: () => h("p", { class: "sample-body" }, "Body"), ...section.slots },
                ),
              ),
          },
        ),
      ]),
    { global: { plugins: [createI18n({ legacy: false, locale: "en", messages: { ru, en } })] } },
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderSections>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

beforeAll(async () => {
  await document.fonts.load('16px "Righteous"');
  await document.fonts.load('300 16px "Martian Mono"');
});

beforeEach(() => {
  setTheme("torii-synth");
});

describe("default heading", () => {
  it("keeps the heading a direct child of the section without a wrapper", async () => {
    const screen = await renderSections([{ props: { name: "Plain", meta: "(3)" } }]);

    expect(pick(screen, ".page-section > .page-section-heading")).not.toBeNull();
    expect(screen.container.querySelector(".page-section-head")).toBeNull();
    expect(screen.container.querySelector(".page-section-end")).toBeNull();
    expect(pick(screen, ".page-section-heading").classList).toContain("page-section-heading-split");
  });
});

describe("hideHeading", () => {
  it("hides the heading from the eyes but keeps it in the page outline", async () => {
    const screen = await renderSections([
      { props: { name: "Introduction", id: "intro", hideHeading: true } },
      { props: { name: "Details", id: "details" } },
    ]);
    const heading = pick<HTMLElement>(screen, "#intro");
    const box = heading.getBoundingClientRect();

    expect(heading.tagName).toBe("H2");
    expect(heading.textContent?.trim()).toBe("Introduction");
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);
    expect(getComputedStyle(heading).position).toBe("absolute");
    expect(
      [...screen.container.querySelectorAll(".page-sections-nav-label")].map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual(["Introduction", "Details"]);
    expect(pick(screen, "#details").getBoundingClientRect().width).toBeGreaterThan(100);
  });

  it("does not take a gap in the section for the hidden heading", async () => {
    const screen = await renderSections([
      { props: { name: "Introduction", id: "intro", hideHeading: true } },
    ]);
    const section = pick(screen, ".page-section");
    const body = pick(screen, ".page-section-body");

    expect(body.getBoundingClientRect().top).toBeCloseTo(section.getBoundingClientRect().top, 0);
  });
});

describe("heading-end slot", () => {
  it("puts the end content next to the heading in one row", async () => {
    const screen = await renderSections([
      {
        props: { name: "Articles", id: "articles" },
        slots: { "heading-end": () => h("a", { class: "sample-end", href: "#top" }, "All") },
      },
    ]);
    const head = pick(screen, ".page-section-head");
    const heading = pick(screen, ".page-section-heading").getBoundingClientRect();
    const end = pick(screen, ".sample-end").getBoundingClientRect();

    expect(head.firstElementChild).toBe(pick(screen, ".page-section-heading"));
    expect(pick(screen, ".page-section-end").contains(pick(screen, ".sample-end"))).toBe(true);
    expect(getComputedStyle(head).display).toBe("flex");
    expect(Math.abs(end.top + end.height / 2 - (heading.top + heading.height / 2))).toBeLessThan(
      30,
    );
    expect(end.left).toBeGreaterThan(heading.right);
    expect(head.getBoundingClientRect().right).toBeCloseTo(end.right, 0);
    expect(pick(screen, "#articles").tagName).toBe("H2");
    expect(pick(screen, "#articles").textContent).not.toContain("All");
  });

  it("wraps the end content under the heading when the row is too narrow", async () => {
    await page.viewport(390, 700);
    const screen = await renderSections([
      {
        props: { name: "Instruments on a very long platform name", id: "articles" },
        slots: {
          "heading-end": () =>
            h("a", { class: "sample-end", href: "#top", style: { width: "200px" } }, "All"),
        },
      },
    ]);
    await page.viewport(390, 700);
    screen.container.getBoundingClientRect();
    const heading = pick(screen, ".page-section-heading").getBoundingClientRect();
    const end = pick(screen, ".sample-end").getBoundingClientRect();

    expect(end.top).toBeGreaterThanOrEqual(heading.bottom - 1);
  });
});

describe("metaInline", () => {
  it("keeps the meta right after the name instead of pushing it to the edge", async () => {
    const screen = await renderSections([
      { props: { name: "Articles", meta: "(3)", metaInline: true } },
    ]);
    const heading = pick(screen, ".page-section-heading");
    const meta = pick(screen, ".page-section-meta").getBoundingClientRect();

    expect(heading.classList).toContain("page-section-heading-inline");
    expect(heading.classList).not.toContain("page-section-heading-split");
    expect(getComputedStyle(heading).display).toBe("block");
    expect(meta.left).toBeLessThan(heading.getBoundingClientRect().left + 220);
  });

  it("lets the meta size be set from outside and defaults to 12px", async () => {
    const screen = await renderSections([{ props: { name: "Plain", meta: "(3)" } }]);
    const meta = pick<HTMLElement>(screen, ".page-section-meta");

    expect(Number.parseFloat(getComputedStyle(meta).fontSize)).toBeCloseTo(12, 0);
    meta.style.setProperty("--page-section-meta-size", "14px");
    expect(Number.parseFloat(getComputedStyle(meta).fontSize)).toBeCloseTo(14, 0);
  });
});
