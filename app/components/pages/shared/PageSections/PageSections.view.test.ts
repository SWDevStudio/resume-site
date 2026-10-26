import { createSSRApp, defineComponent, h, nextTick, ref, type PropType } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import PageSection from "./PageSection.vue";
import PageSections from "./PageSections.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));
vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface View {
  width: number;
  height: number;
}

const outline = [
  { name: "About the project", children: ["Business", "The situation", "The goal"] },
  { name: "Results", children: [] },
  { name: "The process", children: ["Design", "Development"] },
];

const Sample = defineComponent({
  props: {
    block: { type: Number, default: 700 },
    extra: { type: Number, default: 0 },
    ids: { type: Boolean, default: false },
    deep: { type: Boolean, default: false },
    inset: { type: String, default: "" },
    tail: { type: Number, default: 0 },
    names: { type: Array as PropType<typeof outline>, default: () => outline },
  },
  setup(props) {
    function body() {
      return h("p", { class: "sample-block", style: { height: `${props.block}px`, margin: 0 } });
    }
    function child(name: string, index: number, parent: number) {
      const deep = props.deep && name === "Business";
      return h(
        PageSection,
        { name, id: props.ids ? `custom-${parent}-${index}` : undefined },
        {
          default: () => [
            body(),
            deep ? h(PageSection, { name: "Details" }, { default: () => body() }) : null,
          ],
        },
      );
    }
    return () =>
      h(
        PageSections,
        {
          navTitle: "On this page",
          style: props.inset ? { "--page-sections-nav-inset": props.inset } : undefined,
        },
        {
          default: () => [
            h("div", { class: "sample-lead", style: { height: "240px" } }, "lead"),
            ...props.names.map((item, parent) =>
              h(
                PageSection,
                { name: item.name, id: props.ids ? `custom-${parent}` : undefined },
                {
                  default: () =>
                    item.children.length
                      ? item.children.map((name, index) => child(name, index, parent))
                      : body(),
                },
              ),
            ),
            ...Array.from({ length: props.extra }, (_, index) =>
              h(PageSection, { name: `Extra ${index + 1}` }, { default: () => body() }),
            ),
            props.tail ? h("div", { style: { height: `${props.tail}px` } }) : null,
          ],
        },
      );
  },
});

function createApp(locale: Locale = "en") {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
}

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

async function renderSample(
  item: Pick<View, "width" | "height">,
  props: Record<string, unknown> = {},
  header = true,
) {
  await page.viewport(item.width, item.height);
  document.documentElement.lang = "en";
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        header ? h(TheHeader) : null,
        h("main", null, h(Sample, props)),
      ]),
    { global: { plugins: [createApp()] } },
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderSample>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function links(screen: Screen) {
  return pickAll<HTMLAnchorElement>(screen, ".page-sections-nav-link");
}

function current(screen: Screen) {
  return links(screen).find((link) => link.getAttribute("aria-current") === "location");
}

function scrollToTop(top: number) {
  window.scrollTo({ top, behavior: "instant" });
}

function headingOf(screen: Screen, name: string) {
  return pickAll<HTMLElement>(screen, ".page-section-heading").find(
    (heading) => text(heading) === name,
  )!;
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "On this page About the project Business");
  await document.fonts.load('300 1em "Martian Mono"', "The situation Results The process Design");
  await document.fonts.load('400 1em "Martian Mono"', "HOME ABOUT PORTFOLIO");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  scrollToTop(0);
  history.replaceState(null, "", location.pathname + location.search);
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe("registry", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("builds the navigation from the sections in tree order", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100 });

    expect(links(screen).map((link) => text(link))).toEqual([
      "About the project",
      "Business",
      "The situation",
      "The goal",
      "Results",
      "The process",
      "Design",
      "Development",
    ]);
    expect(links(screen).map((link) => link.getAttribute("href"))).toEqual([
      "#section-1",
      "#section-1-1",
      "#section-1-2",
      "#section-1-3",
      "#section-2",
      "#section-3",
      "#section-3-1",
      "#section-3-2",
    ]);
  });

  it("nests the navigation lists like the sections", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100, deep: true });
    const root = pick(screen, ".page-sections-nav-list");
    const top = [...root.children].map((item) => text(item.querySelector(":scope > a")));
    const nested = [...root.querySelectorAll(":scope > li > ul")].map((list) =>
      [...list.children].map((item) => text(item.querySelector(":scope > a"))),
    );

    expect(top).toEqual(["About the project", "Results", "The process"]);
    expect(nested[0]).toEqual(["Business", "The situation", "The goal"]);
    expect(nested[1]).toEqual(["Design", "Development"]);
    expect(
      [...root.querySelectorAll("ul ul ul")].map((list) => text(list.querySelector("a"))),
    ).toEqual(["Details"]);
    expect(
      links(screen).map((link) => link.style.getPropertyValue("--page-sections-depth")),
    ).toEqual(["0", "1", "2", "1", "1", "0", "0", "1", "1"]);
  });

  it("renders headings with levels by nesting and the same ids as the links", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100, deep: true });
    const headings = pickAll<HTMLElement>(screen, ".page-section-heading");

    expect(headings.map((heading) => heading.tagName)).toEqual([
      "H2",
      "H3",
      "H4",
      "H3",
      "H3",
      "H2",
      "H2",
      "H3",
      "H3",
    ]);
    expect(headings.map((heading) => text(heading))).toEqual([
      "About the project",
      "Business",
      "Details",
      "The situation",
      "The goal",
      "Results",
      "The process",
      "Design",
      "Development",
    ]);
    expect(headings.map((heading) => heading.id)).toEqual([
      "section-1",
      "section-1-1",
      "section-1-1-1",
      "section-1-2",
      "section-1-3",
      "section-2",
      "section-3",
      "section-3-1",
      "section-3-2",
    ]);
    for (const section of pickAll(screen, "section.page-section")) {
      const heading = section.querySelector(":scope > .page-section-heading")!;
      expect(section.getAttribute("aria-labelledby")).toBe(heading.id);
    }
    expect(pickAll(screen, ".page-section-root")).toHaveLength(3);
  });

  it("takes the anchor id from the prop", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100, ids: true });

    expect(links(screen).map((link) => link.getAttribute("href"))).toEqual([
      "#custom-0",
      "#custom-0-0",
      "#custom-0-1",
      "#custom-0-2",
      "#custom-1",
      "#custom-2",
      "#custom-2-0",
      "#custom-2-1",
    ]);
    expect(document.getElementById("custom-0-1")!.tagName).toBe("H3");
  });

  it("puts the content before the navigation in the DOM and the navigation to the right", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100 });
    const root = pick(screen, ".page-sections");
    const content = pick(screen, ".page-sections-content").getBoundingClientRect();
    const nav = pick(screen, ".page-sections-nav").getBoundingClientRect();

    expect([...root.children].map((item) => item.className)).toEqual([
      "page-sections-content",
      "page-sections-aside",
    ]);
    expect(nav.left).toBeGreaterThanOrEqual(content.right);
    near(nav.width, 280);
    near(content.width, 784);
    near(nav.left - content.right, 96);
    expect(root.classList.contains("container")).toBe(true);
  });

  it.each([
    { width: 1440, height: 900, columns: 2 },
    { width: 768, height: 700, columns: 1 },
    { width: 390, height: 700, columns: 1 },
  ])("keeps $columns column(s) inside the screen at $width", async (item) => {
    const screen = await renderSample(item, { block: 120 });
    const root = pick(screen, ".page-sections").getBoundingClientRect();
    const content = pick(screen, ".page-sections-content").getBoundingClientRect();
    const nav = pick(screen, ".page-sections-nav").getBoundingClientRect();

    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
    for (const box of [content, nav]) {
      expect(box.left).toBeGreaterThanOrEqual(root.left - 0.5);
      expect(box.right).toBeLessThanOrEqual(root.right + 0.5);
    }
    if (item.columns === 2) {
      expect(nav.left).toBeGreaterThanOrEqual(content.right);
      near(nav.top, content.top, 80);
    } else {
      near(nav.width, content.width);
      expect(content.top).toBeGreaterThanOrEqual(nav.bottom - 0.5);
    }
  });

  it("names the navigation landmark by its title", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { block: 100 });
    const nav = pick(screen, ".page-sections-nav");
    const title = document.getElementById(nav.getAttribute("aria-labelledby")!)!;

    expect(text(title)).toBe("On this page");
  });

  it("registers sections added later in their place in the tree", async () => {
    const hidden = ref(true);
    await page.viewport(1440, 900);
    const screen = await render(
      () =>
        h(
          PageSections,
          { navTitle: "On this page" },
          {
            default: () => [
              h(PageSection, { name: "First" }, { default: () => h("p", "one") }),
              hidden.value ? null : h(PageSection, { name: "Middle" }, { default: () => h("p") }),
              h(PageSection, { name: "Last" }, { default: () => h("p", "three") }),
            ],
          },
        ),
      { global: { plugins: [createApp()] } },
    );
    const labels = () =>
      [...screen.container.querySelectorAll(".page-sections-nav-link")].map((link) => text(link));
    const hrefs = () =>
      [...screen.container.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      );

    expect(labels()).toEqual(["First", "Last"]);

    hidden.value = false;
    await expect.poll(labels).toEqual(["First", "Middle", "Last"]);
    expect(hrefs()).toEqual(["#section-1", "#section-2", "#section-3"]);

    hidden.value = true;
    await expect.poll(labels).toEqual(["First", "Last"]);
    expect(hrefs()).toEqual(["#section-1", "#section-2"]);
  });

  it("renders the navigation on the server", async () => {
    const app = createSSRApp({ render: () => h(Sample, { block: 50 }) });
    app.use(createApp());
    const html = await renderToString(app);
    const root = document.createElement("div");
    root.innerHTML = html;
    const anchors = [...root.querySelectorAll<HTMLAnchorElement>(".page-sections-nav-link")];

    expect(anchors.map((link) => link.textContent?.trim())).toEqual([
      "About the project",
      "Business",
      "The situation",
      "The goal",
      "Results",
      "The process",
      "Design",
      "Development",
    ]);
    expect(anchors.map((link) => link.getAttribute("href"))).toEqual([
      "#section-1",
      "#section-1-1",
      "#section-1-2",
      "#section-1-3",
      "#section-2",
      "#section-3",
      "#section-3-1",
      "#section-3-2",
    ]);
    expect(root.querySelectorAll("h2")).toHaveLength(3);
    expect(root.querySelector("nav")!.compareDocumentPosition(root.querySelector("h2")!)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(root.querySelector(".page-sections-nav-link[aria-current]")!.textContent?.trim()).toBe(
      "Business",
    );
  });
});

describe("anchors and scrolling", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { name: "desktop", width: 1440, height: 900, header: 70 },
    { name: "tablet", width: 768, height: 900, header: 94 },
    { name: "mobile", width: 390, height: 780, header: 92 },
  ])("leaves room for the fixed header above anchors on $name", async (item) => {
    const screen = await renderSample(item);
    const header = pick(screen, "header").getBoundingClientRect().height;

    near(header, item.header);
    for (const heading of pickAll(screen, ".page-section-heading")) {
      near(Number.parseFloat(getComputedStyle(heading).scrollMarginTop), item.header + 32);
    }
  });

  it("starts the page below the fixed header", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const header = pick(screen, "header").getBoundingClientRect();
    const content = pick(screen, ".page-sections-content").getBoundingClientRect();

    expect(content.top).toBeGreaterThanOrEqual(header.bottom - 0.5);
  });

  it("turns smooth scrolling on only without reduced motion", async () => {
    await renderSample({ width: 1440, height: 900 }, { block: 100 });
    expect(getComputedStyle(document.documentElement).scrollBehavior).toBe("smooth");

    await setReducedMotion("reduce");
    expect(getComputedStyle(document.documentElement).scrollBehavior).toBe("auto");
  });

  it("marks the first chapter as current before any scrolling", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });

    expect(text(current(screen))).toBe("Business");
    expect(links(screen).filter((link) => link.hasAttribute("aria-current"))).toHaveLength(1);
  });

  it("follows the scroll position", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const targets = [
      "The situation",
      "The goal",
      "Results",
      "The process",
      "Design",
      "Development",
    ];

    for (const name of targets) {
      const heading = headingOf(screen, name);
      const top = heading.getBoundingClientRect().top + window.scrollY;
      scrollToTop(top - 102);
      await expect.poll(() => text(current(screen))).toBe(name);
    }

    scrollToTop(0);
    await expect.poll(() => text(current(screen))).toBe("Business");
  });

  it("switches the current chapter when a heading passes the reading line", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const heading = headingOf(screen, "Results");
    const top = heading.getBoundingClientRect().top + window.scrollY;

    scrollToTop(top - 300);
    await expect.poll(() => text(current(screen))).toBe("The goal");
    scrollToTop(top - 90);
    await expect.poll(() => text(current(screen))).toBe("Results");
  });

  it("jumps to the section with a plain anchor and does not write a hash handler of its own", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const anchor = links(screen).find((link) => text(link) === "The goal")!;
    const heading = headingOf(screen, "The goal");

    expect(anchor.tagName).toBe("A");
    expect(anchor.getAttribute("href")).toBe("#section-1-3");
    anchor.click();
    await expect
      .poll(() => Math.round(heading.getBoundingClientRect().top), { timeout: 3000 })
      .toBe(102);
    expect(location.hash).toBe("#section-1-3");
    await expect.poll(() => text(current(screen))).toBe("The goal");
  });

  it("marks the last section when the end of the page is reached", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });

    scrollToTop(document.documentElement.scrollHeight);
    await expect.poll(() => text(current(screen))).toBe("Development");
    scrollToTop(0);
    await expect.poll(() => text(current(screen))).toBe("Business");
  });

  it("finds the current section after a jump over several sections", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { tail: 1200 });
    const heading = headingOf(screen, "Design");

    scrollToTop(heading.getBoundingClientRect().top + window.scrollY - 102);
    await expect.poll(() => text(current(screen))).toBe("Design");
    scrollToTop(headingOf(screen, "The goal").getBoundingClientRect().top + window.scrollY - 102);
    await expect.poll(() => text(current(screen))).toBe("The goal");
  });

  it("does not write the hash while scrolling", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const heading = headingOf(screen, "Results");

    scrollToTop(heading.getBoundingClientRect().top + window.scrollY - 102);
    await expect.poll(() => text(current(screen))).toBe("Results");
    expect(location.hash).toBe("");
  });
});

describe("desktop panel", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("is sticky under the fixed header", async () => {
    const screen = await renderSample({ width: 1440, height: 900 }, { inset: "300px" });
    const nav = pick(screen, ".page-sections-nav");

    expect(getComputedStyle(nav).position).toBe("sticky");
    const start = nav.getBoundingClientRect().top;
    near(start, 70 + 300);

    scrollToTop(1500);
    await expect.poll(() => Math.round(nav.getBoundingClientRect().top)).toBe(102);
    scrollToTop(2400);
    await expect.poll(() => Math.round(nav.getBoundingClientRect().top)).toBe(102);
    scrollToTop(0);
    await expect.poll(() => Math.round(nav.getBoundingClientRect().top)).toBe(Math.round(start));
  });

  it("is not sticky below the large breakpoint", async () => {
    const screen = await renderSample({ width: 768, height: 900 });

    expect(getComputedStyle(pick(screen, ".page-sections-nav")).position).toBe("relative");
  });

  it("shows the title and the list without a toggle", async () => {
    const screen = await renderSample({ width: 1440, height: 900 });
    const head = pick(screen, ".page-sections-nav-head");
    const panel = pick(screen, ".page-sections-nav-panel");

    await expect.poll(() => head.tagName).toBe("DIV");
    expect(head.hasAttribute("aria-expanded")).toBe(false);
    expect(getComputedStyle(panel).visibility).toBe("visible");
    expect(getComputedStyle(pick(screen, ".page-sections-nav-summary")).display).toBe("none");
    expect(getComputedStyle(pick(screen, ".page-sections-nav-chevron")).display).toBe("none");
  });

  it("limits its height to the screen and scrolls inside when there are many chapters", async () => {
    const screen = await renderSample({ width: 1440, height: 700 }, { block: 100, extra: 24 });
    const nav = pick(screen, ".page-sections-nav")!;
    const scroll = pick(screen, ".page-sections-nav-scroll");
    const rect = nav.getBoundingClientRect();

    expect(links(screen)).toHaveLength(32);
    expect(getComputedStyle(scroll).overflowY).toBe("auto");
    expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);
    expect(rect.height).toBeLessThanOrEqual(700 - 102 - 32 + 1);
    scrollToTop(900);
    await expect.poll(() => Math.round(nav.getBoundingClientRect().top)).toBe(102);
    expect(nav.getBoundingClientRect().bottom).toBeLessThanOrEqual(700 - 32 + 1);
    scroll.scrollTop = scroll.scrollHeight;
    expect(scroll.scrollTop).toBeGreaterThan(0);
  });

  it("truncates long names with an ellipsis", async () => {
    const screen = await renderSample(
      { width: 1440, height: 900 },
      {
        block: 100,
        names: [
          {
            name: "A very long chapter name that cannot fit into the narrow navigation column",
            children: [],
          },
        ],
      },
    );
    const label = pick(screen, ".page-sections-nav-label");

    expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  });

  it.each([
    {
      theme: "torii-synth",
      cut: 18,
      radius: 0,
      border: "rgba(0, 0, 0, 0)",
    },
    { theme: "cyber-sakura", cut: 0, radius: 22, border: "rgba(0, 0, 0, 0)" },
  ])("draws the $theme frame", async ({ theme, cut, radius }) => {
    setTheme(theme);
    const screen = await renderSample({ width: 1440, height: 900 });
    const frame = pick(screen, ".page-sections-nav > .page-sections-nav-frame");
    const style = getComputedStyle(frame);
    const inner = getComputedStyle(frame, "::before");

    near(Number.parseFloat(style.borderTopLeftRadius), radius);
    near(Number.parseFloat(inner.borderTopLeftRadius), Math.max(0, radius - 1));
    expect(style.clipPath.startsWith("polygon(")).toBe(true);
    const first = Number.parseFloat(style.clipPath.slice(8));
    near(first, cut);
    near(Number.parseFloat(frame.getBoundingClientRect().width.toString()), 280);
  });
});

describe("collapsed panel on tablet and mobile", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each([
    { name: "tablet", width: 768, height: 900, left: 32, size: 704 },
    { name: "mobile", width: 390, height: 780, left: 20, size: 350 },
  ])("lays out the pill like the mockup on $name", async (item) => {
    const screen = await renderSample(item);
    const nav = pick(screen, ".page-sections-nav").getBoundingClientRect();
    const header = pick(screen, "header").getBoundingClientRect();

    near(nav.left, item.left);
    near(nav.width, item.size);
    near(nav.height, 70.4);
    near(nav.top - header.bottom, 28);
    near(pick(screen, ".page-sections-content").getBoundingClientRect().top, nav.bottom, 0.5);
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
    expect(text(pick(screen, ".page-sections-nav-summary"))).toBe("Business · 8 sections");
    expect(getComputedStyle(pick(screen, ".page-sections-nav-chevron")).display).toBe("block");
    expect(getComputedStyle(pick(screen, ".page-sections-nav")).position).toBe("relative");
    expect(pick(screen, ".page-sections-nav-head").tagName).toBe("BUTTON");
  });

  it("counts the sections with a singular form", async () => {
    const screen = await renderSample(
      { width: 390, height: 780 },
      { names: [{ name: "Only", children: [] }] },
    );

    expect(text(pick(screen, ".page-sections-nav-summary"))).toBe("Only · 1 section");
  });

  it("starts closed with a hidden list that cannot take focus", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");
    const panel = pick(screen, ".page-sections-nav-panel");

    expect(head.getAttribute("aria-expanded")).toBe("false");
    expect(head.getAttribute("aria-controls")).toBe(panel.id);
    expect(getComputedStyle(panel).visibility).toBe("hidden");
    expect(getComputedStyle(panel).opacity).toBe("0");
  });

  it("opens and closes with the toggle and animates the state change", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");
    const panel = pick(screen, ".page-sections-nav-panel");
    const chevron = pick(screen, ".page-sections-nav-chevron");

    head.click();
    await nextTick();
    expect(head.getAttribute("aria-expanded")).toBe("true");
    const running = document.getAnimations().filter((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return animation instanceof CSSTransition && (target === panel || target === chevron);
    });
    expect(running.map((animation) => (animation as CSSTransition).transitionProperty)).toEqual(
      expect.arrayContaining(["opacity", "transform"]),
    );
    finishAnimations();
    expect(getComputedStyle(panel).visibility).toBe("visible");
    expect(getComputedStyle(panel).opacity).toBe("1");
    expect(getComputedStyle(panel).transform).toBe("none");
    expect(getComputedStyle(chevron).transform).toBe("matrix(-1, 0, 0, -1, 0, 0)");
    expect(panel.getBoundingClientRect().top).toBeGreaterThan(
      pick(screen, ".page-sections-nav-head").getBoundingClientRect().bottom,
    );

    head.click();
    await nextTick();
    expect(head.getAttribute("aria-expanded")).toBe("false");
    expect(
      document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && effect?.target === panel;
      }),
    ).toBe(true);
    finishAnimations();
    expect(getComputedStyle(panel).visibility).toBe("hidden");
    expect(getComputedStyle(panel).opacity).toBe("0");
    expect(getComputedStyle(chevron).transform).toBe("none");
  });

  it("opens the list over the content without pushing it down", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const content = pick(screen, ".page-sections-content");
    const before = content.getBoundingClientRect().top;

    pick<HTMLButtonElement>(screen, ".page-sections-nav-head").click();
    await nextTick();
    finishAnimations();

    expect(content.getBoundingClientRect().top).toBe(before);
    const panel = pick(screen, ".page-sections-nav-panel").getBoundingClientRect();
    near(panel.width, 350);
    expect(Number(getComputedStyle(pick(screen, ".page-sections-aside")).zIndex)).toBeGreaterThan(
      0,
    );
    expect(
      document.elementFromPoint(panel.left + 40, panel.top + 20)?.closest(".page-sections-nav"),
    ).not.toBeNull();
  });

  it("closes after choosing a section and jumps to it", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");

    head.click();
    await nextTick();
    finishAnimations();
    const anchor = links(screen).find((link) => text(link) === "Design")!;
    anchor.click();
    await nextTick();

    expect(head.getAttribute("aria-expanded")).toBe("false");
    await expect
      .poll(() => Math.round(headingOf(screen, "Design").getBoundingClientRect().top), {
        timeout: 3000,
      })
      .toBe(124);
    await expect
      .poll(() => text(pick(screen, ".page-sections-nav-summary")))
      .toBe("Design · 8 sections");
  });

  it("closes on Escape and returns the focus to the toggle", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");

    head.click();
    await nextTick();
    finishAnimations();
    links(screen)[1]!.focus();
    expect(document.activeElement).toBe(links(screen)[1]);
    await userEvent.keyboard("{Escape}");

    expect(head.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(head);
  });

  it("closes on a click outside", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");

    head.click();
    await nextTick();
    expect(head.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(pick(screen, ".the-header-bar"), { position: { x: 4, y: 4 } });

    expect(head.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens from the keyboard", async () => {
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");

    head.focus();
    await userEvent.keyboard("{Enter}");
    expect(head.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Escape}");
    expect(head.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not animate with reduced motion and still ends in the right state", async () => {
    await setReducedMotion("reduce");
    const screen = await renderSample({ width: 390, height: 780 });
    const head = pick<HTMLButtonElement>(screen, ".page-sections-nav-head");
    const panel = pick(screen, ".page-sections-nav-panel");

    head.click();
    await nextTick();
    expect(
      document.getAnimations().filter((animation) => animation instanceof CSSTransition),
    ).toHaveLength(0);
    expect(getComputedStyle(panel).visibility).toBe("visible");
    expect(getComputedStyle(panel).opacity).toBe("1");
    head.click();
    await nextTick();
    expect(getComputedStyle(panel).visibility).toBe("hidden");
    expect(getComputedStyle(pick(screen, ".page-sections-nav-chevron")).transform).toBe("none");
  });

  it("animates the active link marker and the hover color", async () => {
    await page.viewport(1440, 900);
    const screen = await renderSample({ width: 1440, height: 900 });
    const [, , second] = links(screen);
    const first = links(screen)[1]!;

    expect(getComputedStyle(first, "::before").opacity).toBe("1");
    expect(getComputedStyle(second!, "::before").opacity).toBe("0");

    const target = headingOf(screen, "The situation");
    scrollToTop(target.getBoundingClientRect().top + window.scrollY - 102);
    await expect.poll(() => text(current(screen))).toBe("The situation");
    expect(
      document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return (
          animation instanceof CSSTransition &&
          effect?.target === second &&
          effect.pseudoElement === "::before" &&
          animation.transitionProperty === "opacity"
        );
      }),
    ).toBe(true);
    finishAnimations();
    expect(getComputedStyle(second!, "::before").opacity).toBe("1");
    expect(getComputedStyle(first, "::before").opacity).toBe("0");

    const link = links(screen)[3]!;
    const idle = getComputedStyle(link).color;
    await userEvent.hover(link);
    expect(
      document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return (
          animation instanceof CSSTransition &&
          effect?.target === link &&
          animation.transitionProperty === "color"
        );
      }),
    ).toBe(true);
    finishAnimations();
    expect(getComputedStyle(link).color).not.toBe(idle);
    expect(getComputedStyle(link, "::before").opacity).toBe("0.5");
  });
});

describe("theme", () => {
  it("draws the active marker with a glow in Torii Synth and a rounded one in Cyber Sakura", async () => {
    setTheme("torii-synth");
    const screen = await renderSample({ width: 1440, height: 900 });
    const link = links(screen)[1]!;

    expect(getComputedStyle(link, "::before").boxShadow).not.toBe("none");
    expect(getComputedStyle(link, "::before").borderTopLeftRadius).toBe("0px");

    setTheme("cyber-sakura");
    finishAnimations();
    expect(getComputedStyle(link, "::before").borderTopLeftRadius).not.toBe("0px");
  });

  it("fades the frame and the colors between themes", async () => {
    setTheme("torii-synth");
    const screen = await renderSample({ width: 1440, height: 900 });
    const frame = pick(screen, ".page-sections-nav > .page-sections-nav-frame");
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const properties = document
      .getAnimations()
      .filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && effect?.target === frame;
      })
      .map((animation) => (animation as CSSTransition).transitionProperty);

    expect(properties).toEqual(
      expect.arrayContaining(["background-color", "border-top-left-radius"]),
    );
    expect(properties).toContain("clip-path");
  });

  it("keeps the frame transitions off with reduced motion", async () => {
    await setReducedMotion("reduce");
    setTheme("torii-synth");
    const screen = await renderSample({ width: 1440, height: 900 });
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");
    const animated = [
      ".page-sections-nav > .page-sections-nav-frame",
      ".page-sections-nav-link",
      ".page-sections-nav-panel",
      ".page-sections-nav-chevron",
    ].map((selector) => pick(screen, selector));

    expect(
      document.getAnimations().filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && animated.includes(effect?.target as Element);
      }),
    ).toHaveLength(0);
  });
});

const Extras = defineComponent({
  props: {
    countRoots: { type: Boolean, default: false },
    plain: { type: Boolean, default: false },
    navTop: { type: String, default: "" },
  },
  setup(props) {
    function body() {
      return h("p", { style: { height: "400px", margin: 0 } });
    }
    return () =>
      h(
        PageSections,
        {
          navTitle: "On this page",
          countRoots: props.countRoots,
          style: props.navTop ? { "--page-sections-nav-top": props.navTop } : undefined,
        },
        {
          default: () => [
            h(
              PageSection,
              {
                name: "Summary",
                id: "summary",
                label: props.plain ? undefined : "01 — SUMMARY",
                ruled: !props.plain,
              },
              { default: () => body() },
            ),
            h(
              PageSection,
              { name: "Work", id: "work", label: props.plain ? undefined : "02 — WORK" },
              {
                default: () =>
                  h(
                    PageSection,
                    {
                      name: "Company",
                      id: "company",
                      meta: props.plain ? undefined : "[MM.YYYY] — present",
                    },
                    { default: () => body() },
                  ),
              },
            ),
          ],
        },
      );
  },
});

describe("optional extras of the sections", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  async function renderExtras(
    item: Pick<View, "width" | "height">,
    props: Record<string, unknown> = {},
  ) {
    await page.viewport(item.width, item.height);
    const screen = await render(
      () =>
        h("div", { class: "bg-base-100 font-body text-base-content" }, [
          h(TheHeader),
          h("main", null, h(Extras, props)),
        ]),
      { global: { plugins: [createApp()] } },
    );
    await nextTick();
    screen.container.getBoundingClientRect();
    return screen;
  }

  it("renders the caption, the heading and the rule in a column without a wrapper", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 });
    const section = pick(screen, ".page-section-root");

    expect([...section.children].map((child) => child.className)).toEqual([
      "page-section-label",
      "page-section-heading",
      "page-section-rule",
      "page-section-body",
    ]);
    expect(text(pick(screen, ".page-section-label"))).toBe("01 — SUMMARY");
    expect(pickAll(screen, ".page-section-label")).toHaveLength(2);
    expect(pickAll(screen, ".page-section-rule")).toHaveLength(1);
    near(
      pick(screen, ".page-section-heading").getBoundingClientRect().top -
        pick(screen, ".page-section-label").getBoundingClientRect().bottom,
      10,
    );
    near(
      pick(screen, ".page-section-rule").getBoundingClientRect().top -
        pick(screen, ".page-section-heading").getBoundingClientRect().bottom,
      16,
    );
  });

  it("draws the accent bar over the rule", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 });
    const rule = getComputedStyle(pick(screen, ".page-section-rule"));
    const bar = getComputedStyle(pick(screen, ".page-section-rule"), "::before");

    near(Number.parseFloat(rule.height), 1);
    near(Number.parseFloat(bar.width), 56);
    near(Number.parseFloat(bar.height), 3);
    near(Number.parseFloat(bar.top), -1);
    expect(bar.backgroundColor).not.toBe(rule.backgroundColor);
  });

  it("puts the period next to the heading and wraps it when there is no room", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 });
    const heading = pick(screen, ".page-section-level-3 > .page-section-heading");
    const meta = pick(screen, ".page-section-meta");

    expect(heading.classList.contains("page-section-heading-split")).toBe(true);
    expect(text(meta)).toBe("[MM.YYYY] — present");
    expect(getComputedStyle(heading).display).toBe("flex");
    near(meta.getBoundingClientRect().right, heading.getBoundingClientRect().right);
    expect(meta.getBoundingClientRect().left).toBeGreaterThan(
      heading.getBoundingClientRect().left + 40,
    );
    expect(text(pickAll(screen, ".page-section-heading").at(-1))).toBe(
      "Company [MM.YYYY] — present",
    );

    await page.viewport(280, 700);
    screen.container.getBoundingClientRect();
    expect(meta.getBoundingClientRect().left).toBeLessThan(
      heading.getBoundingClientRect().left + 5,
    );
    expect(meta.getBoundingClientRect().top).toBeGreaterThan(
      heading.getBoundingClientRect().top + 10,
    );
  });

  it("keeps a section without extras exactly as before", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 }, { plain: true });
    const section = pick(screen, ".page-section-root");

    expect([...section.children].map((child) => child.className)).toEqual([
      "page-section-heading",
      "page-section-body",
    ]);
    expect(pickAll(screen, ".page-section-meta")).toHaveLength(0);
    expect(
      pick(screen, ".page-section-level-3 > .page-section-heading").classList.contains(
        "page-section-heading-split",
      ),
    ).toBe(false);
    expect(getComputedStyle(pick(screen, ".page-section-heading")).display).toBe("block");
  });

  it("scrolls to a captioned heading below the caption", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 });
    const captioned = getComputedStyle(pick(screen, "#summary"));
    const plain = getComputedStyle(pick(screen, "#company"));

    near(Number.parseFloat(plain.scrollMarginTop), 102);
    near(Number.parseFloat(captioned.scrollMarginTop), 102 + 21.6 + 10);
  });

  it("counts every section or only the first level in the pill", async () => {
    const all = await renderExtras({ width: 390, height: 700 });
    expect(text(pick(all, ".page-sections-nav-summary"))).toBe("Summary · 3 sections");
    all.unmount();

    const roots = await renderExtras({ width: 390, height: 700 }, { countRoots: true });
    expect(text(pick(roots, ".page-sections-nav-summary"))).toBe("Summary · 2 sections");
  });

  it("sticks the panel at its own top when the variable is set", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 }, { navTop: "96px" });
    const nav = pick(screen, ".page-sections-nav");

    expect(getComputedStyle(nav).top).toBe("96px");
    near(Number.parseFloat(getComputedStyle(nav).maxHeight), 900 - 96 - 32);
    window.scrollTo({ top: 300, behavior: "instant" });
    await nextTick();
    near(nav.getBoundingClientRect().top, 96);
  });

  it("sticks the panel under the header by default", async () => {
    const screen = await renderExtras({ width: 1440, height: 900 });
    const nav = pick(screen, ".page-sections-nav");

    near(Number.parseFloat(getComputedStyle(nav).top), 102);
    window.scrollTo({ top: 300, behavior: "instant" });
    await nextTick();
    near(nav.getBoundingClientRect().top, 102);
  });
});
