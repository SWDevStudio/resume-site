import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import ProjectCase from "./ProjectCase.vue";
import { $api } from "~/assets/api";
import { buildCase } from "~/assets/api/mock/build";
import { loadProjectMedia } from "~/assets/api/mock/media";
import { staticSources } from "~/assets/api/mock/sources.static";
import brendmartFile from "~/assets/data/projects/brendmart/en";
import { projectDefinitions } from "~/assets/data/projects";
import qwixitFile from "~/assets/data/projects/qwixit/en";
import tamrielCodexFile from "~/assets/data/projects/tamriel-codex/en";
import type {
  ProjectBlock,
  ProjectCaseChallengesData,
  ProjectCaseChapterData,
  ProjectCaseCoverData,
  ProjectCaseCtaData,
  ProjectCaseHeaderData,
  ProjectCaseMetaData,
  ProjectCaseNextData,
  ProjectCaseResultsData,
  ProjectCaseRoleData,
  ProjectCaseTextData,
} from "~/assets/api/types/projectCase";
import type { ProjectStackItem } from "~/assets/api/types/catalog";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));
vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));
vi.mock("~/assets/api/locale", () => ({ resolveLocale: () => "en" }));

interface CaseView {
  width: number;
  height: number;
  slug?: string;
}

const sources = { ...staticSources("en"), media: await loadProjectMedia() };
const qwixitCase = buildCase("qwixit", sources, qwixitFile, "en")!;
const brendmartCase = buildCase("brendmart", sources, brendmartFile, "en")!;
const tamrielCodexCase = buildCase("tamriel-codex", sources, tamrielCodexFile, "en")!;

const caseFiles: Record<string, ProjectBlock[]> = {
  qwixit: qwixitCase,
  brendmart: brendmartCase,
  "tamriel-codex": tamrielCodexCase,
};

function blockData<T>(blocks: ProjectBlock[], component: string) {
  return blocks.find((block) => block.component === component)!.data as unknown as T;
}

const projectCases = Object.entries(caseFiles).map(([slug, blocks]) => ({
  slug,
  blocks,
  header: blockData<ProjectCaseHeaderData>(blocks, "ProjectCaseHeader"),
  cover: blockData<ProjectCaseCoverData>(blocks, "ProjectCaseCover"),
  meta: blockData<ProjectCaseMetaData>(blocks, "ProjectCaseMeta"),
  next: blockData<ProjectCaseNextData>(blocks, "ProjectCaseNext"),
}));

const qwixit = projectCases[0]!;

interface Section {
  id: string;
  name: string;
  heading: string;
  level: 2 | 3;
}

function sectionsOf(blocks: ProjectBlock[], level: 2 | 3 = 2): Section[] {
  return blocks.flatMap((block): Section[] => {
    if (block.component === "ProjectCaseRole") {
      const data = block.data as unknown as ProjectCaseRoleData;
      return [{ id: data.id, name: data.name, heading: data.name, level }];
    }
    if (block.component === "ProjectCaseChapter") {
      const data = block.data as unknown as ProjectCaseChapterData;
      return [
        { id: data.id, name: data.name, heading: data.name, level },
        ...sectionsOf(data.blocks, 3),
      ];
    }
    if (block.component === "ProjectCaseChallenges") {
      const data = block.data as unknown as ProjectCaseChallengesData;
      return data.items.map((item) => ({
        id: item.id,
        name: item.name,
        heading: item.name,
        level: 3 as const,
      }));
    }
    if (block.component === "ProjectCaseCta") {
      const data = block.data as unknown as ProjectCaseCtaData;
      return [{ id: data.id, name: en.projects.case.cta.nav, heading: data.title, level }];
    }
    return [];
  });
}

function textsOf(blocks: ProjectBlock[]): string[] {
  return blocks.flatMap((block) => {
    if (block.component === "ProjectCaseText") {
      return [(block.data as unknown as ProjectCaseTextData).text];
    }
    if (block.component === "ProjectCaseChapter") {
      return textsOf((block.data as unknown as ProjectCaseChapterData).blocks);
    }
    return [];
  });
}

function findBlocks(blocks: ProjectBlock[], component: string): ProjectBlock[] {
  return blocks.flatMap((block) => [
    ...(block.component === component ? [block] : []),
    ...(block.component === "ProjectCaseChapter"
      ? findBlocks((block.data as unknown as ProjectCaseChapterData).blocks, component)
      : []),
  ]);
}

const qwixitSections = sectionsOf(qwixit.blocks);
const qwixitStats = (
  findBlocks(qwixit.blocks, "ProjectCaseResults")[0]!.data as unknown as ProjectCaseResultsData
).stats;

function nextOf(slug: string) {
  const ids = projectDefinitions.map((project) => project.id);
  const index = ids.indexOf(slug);
  return {
    slug: ids[(index + 1) % ids.length]!,
    label: String(((index + 1) % ids.length) + 1).padStart(2, "0"),
  };
}

function caseStackOf(slug: string) {
  return sources.projects.find((project) => project.id === slug)!.caseStack ?? [];
}

function createApp(locale: Locale) {
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

async function renderCase(
  item: Pick<CaseView, "width" | "height" | "slug">,
  locale: Locale = "en",
  header = true,
) {
  await page.viewport(item.width, item.height);
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        header ? h(TheHeader) : null,
        h("main", null, h(ProjectCase, { blocks: caseFiles[item.slug ?? "qwixit"]! })),
      ]),
    { global: { plugins: [createApp(locale)] } },
  );
  await Promise.all(
    [...screen.container.querySelectorAll("img")].map((image) => image.decode().catch(() => {})),
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderCase>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function expectStack(screen: Screen, stack: ProjectStackItem[]) {
  const chips = pickAll(screen, ".project-case-stack-item");
  const own = stack.map((item) => Boolean(item.own));

  if (stack.length === 0) {
    expect(pickAll(screen, ".project-case-stack")).toHaveLength(0);
    return;
  }
  expect(pick(screen, ".project-case-stack-list").getAttribute("lang")).toBe("en");
  expect(pick(screen, ".project-case-stack-list").hasAttribute("data-atom-skip")).toBe(true);
  expect(chips).toHaveLength(stack.length);
  expect(chips.every((chip) => chip.classList.contains("badge"))).toBe(true);
  expect(chips.map((chip) => text(chip))).toEqual(stack.map((item) => item.label));
  expect(chips.map((chip) => chip.classList.contains("project-case-stack-own"))).toEqual(own);
  const dots = chips.map((chip) => chip.querySelector(".project-case-stack-dot") !== null);
  expect(dots).toEqual(own);
  expect(pickAll(screen, ".project-case-stack-legend")).toHaveLength(own.includes(true) ? 1 : 0);
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function rect(screen: Screen, selector: string) {
  return pick(screen, selector).getBoundingClientRect();
}

function size(screen: Screen, selector: string) {
  return Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
}

function resolve(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function transitioning(element: Element, property: string, pseudo: string | null = null) {
  return document.getAnimations().some((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === property &&
      effect?.target === element &&
      effect.pseudoElement === pseudo
    );
  });
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Qwixit About the project Business");
  await document.fonts.load('700 1em "Montserrat Alternates"', "На этой странице");
  await document.fonts.load('300 1em "Martian Mono"', "The situation 01 FASHION MARKETPLACE");
  await document.fonts.load('400 1em "Martian Mono"', "LIVE SITE Live site");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  finishAnimations();
  window.scrollTo({ top: 0, behavior: "instant" });
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe("data", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("loads the blocks of a project from the api by its slug and builds the generated ones", async () => {
    expect(await $api.projects.fetchCase("qwixit")).toEqual(qwixitCase);
    expect(await $api.projects.fetchCase("brendmart")).toEqual(brendmartCase);
    expect(await $api.projects.fetchCase("tamriel-codex")).toEqual(tamrielCodexCase);
    expect($api.projects.fetchCase("qwixit")).toBeInstanceOf(Promise);
  });

  it.each(["unknown", "tamrielCodex", "", "../projects/qwixit", "qwixit.json"])(
    "returns null for the unknown slug %j",
    async (slug) => {
      expect(await $api.projects.fetchCase(slug)).toBeNull();
    },
  );

  it("stores every project as a list of component and data pairs", () => {
    for (const item of projectCases) {
      expect(Array.isArray(item.blocks)).toBe(true);
      for (const block of item.blocks) {
        expect(Object.keys(block).sort()).toEqual(["component", "data"]);
        expect(typeof block.component).toBe("string");
        expect(typeof block.data).toBe("object");
      }
    }
  });

  it("chains the next project and wraps around", () => {
    const ids = projectDefinitions.map((project) => project.id);

    expect(projectCases.map((item) => item.next.slug)).toEqual(
      projectCases.map((item) => nextOf(item.slug).slug),
    );
    expect(projectCases.map((item) => item.next.index)).toEqual(
      projectCases.map((item) => nextOf(item.slug).label),
    );
    expect(nextOf(ids.at(-1)!).slug).toBe(ids[0]);
    expect(nextOf(ids[0]!).label).toBe("02");
  });

  it("skips a block of an unknown component and keeps the rest", async () => {
    const blocks: ProjectBlock[] = [
      { component: "Unknown", data: {} },
      ...qwixitCase.slice(0, 1),
      { component: "ProjectCaseText", data: { text: "Loose paragraph" } },
    ];
    await page.viewport(1440, 900);
    const screen = await render(() => h("main", null, h(ProjectCase, { blocks })), {
      global: { plugins: [createApp("en")] },
    });

    expect(pickAll(screen, "h1")).toHaveLength(1);
    expect(pickAll(screen, ".project-case-text").map((item) => text(item))).toEqual([
      "Loose paragraph",
    ]);
  });

  it("builds the page from any order and nesting of the blocks", async () => {
    const blocks: ProjectBlock[] = [
      { component: "ProjectCaseText", data: { text: "Intro" } },
      {
        component: "ProjectCaseChapter",
        data: {
          id: "first",
          name: "First",
          blocks: [
            {
              component: "ProjectCaseChapter",
              data: {
                id: "inner",
                name: "Inner",
                blocks: [{ component: "ProjectCaseText", data: { text: "Deep" } }],
              },
            },
          ],
        },
      },
      { component: "ProjectCaseText", data: { text: "Middle" } },
      {
        component: "ProjectCaseChapter",
        data: { id: "second", name: "Second", blocks: [] },
      },
    ];
    await page.viewport(1440, 900);
    const screen = await render(() => h("main", null, h(ProjectCase, { blocks })), {
      global: { plugins: [createApp("en")] },
    });

    expect(
      pickAll(screen, ".page-section-heading").map((item) => `${item.tagName} ${text(item)}`),
    ).toEqual(["H2 First", "H3 Inner", "H2 Second"]);
    expect(pickAll(screen, ".project-case-chapters")).toHaveLength(2);
    expect(pickAll(screen, ".page-sections-nav-link").map((item) => text(item))).toEqual([
      "First",
      "Inner",
      "Second",
    ]);
  });
});

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the heading block of the case from the mock", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const root = pick(screen, ".project-case");

    expect(root.classList.contains("page-sections")).toBe(true);
    expect(root.classList.contains("container")).toBe(true);
    expect(pickAll(screen, "h1")).toHaveLength(1);
    expect(text(pick(screen, "h1"))).toBe(`Qwixit: ${qwixit.header.headline}`);
    expect(qwixit.header.headline.length).toBeGreaterThan(0);
    expect(text(pick(screen, ".project-case-label"))).toBe(
      `${qwixit.header.index} · ${qwixit.header.subtitle}`,
    );
    expect(pickAll(screen, ".project-case-tag").map((tag) => text(tag))).toEqual(qwixit.meta.tags);
    expect(qwixit.meta.tags.length).toBeGreaterThan(0);
    expect(text(pick(screen, ".project-case-stack-label"))).toBe("Stack:");
    expect(qwixit.meta.stack).toEqual(caseStackOf("qwixit"));
    expectStack(screen, qwixit.meta.stack);
    const labels = pickAll(screen, ".project-case-stack-item").map((chip) => text(chip));
    expect(labels.slice(0, 2)).toEqual(["TypeScript", "Vue 3"]);
    expect(text(pick(screen, ".project-case-stack-legend"))).toBe("used by me");
    expect(pick(screen, ".project-case-stack [data-atom-skip]").getAttribute("lang")).toBe("en");
    expect(pick(screen, ".project-case-title [data-atom-skip]").getAttribute("lang")).toBe("en");
  });

  it("renders every chapter and subsection with its text", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const headings = pickAll(screen, ".page-section-heading");

    expect(headings.map((heading) => `${heading.tagName} ${text(heading)} #${heading.id}`)).toEqual(
      qwixitSections.map((section) => `H${section.level} ${section.heading} #${section.id}`),
    );
    expect(qwixitSections.length).toBeGreaterThan(10);
    expect(pickAll(screen, ".project-case-text").map((item) => text(item))).toEqual(
      textsOf(qwixit.blocks).map((item) => item.replace(/\s+/g, " ").trim()),
    );
    expect(pickAll(screen, ".page-section-root")).toHaveLength(
      qwixitSections.filter((section) => section.level === 2).length,
    );
  });

  it("renders the result numbers inside the results section", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const results = pick(screen, "section[aria-labelledby='results']");
    const inside = { container: results } as Screen;

    expect(qwixitStats.length).toBeGreaterThan(1);
    expect(pickAll(inside, ".project-case-stat-value").map((item) => text(item))).toEqual(
      qwixitStats.map((stat) => stat.value),
    );
    expect(pickAll(inside, ".project-case-stat-label").map((item) => text(item))).toEqual(
      qwixitStats.map((stat) => stat.label),
    );
    expect(pickAll(screen, ".project-case-results")).toHaveLength(1);
  });

  it("builds the page navigation from the chapters", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const anchors = pickAll<HTMLAnchorElement>(screen, ".page-sections-nav-link");

    expect(anchors.map((link) => text(link))).toEqual(
      qwixitSections.map((section) => section.name),
    );
    expect(anchors.map((link) => link.getAttribute("href"))).toEqual(
      qwixitSections.map((section) => `#${section.id}`),
    );
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
    expect(text(anchors.find((link) => link.getAttribute("aria-current")))).toBe(
      qwixitSections[0]!.name,
    );
  });

  it("links back to all projects, to the live site and to the next project", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const back = pick<HTMLAnchorElement>(screen, ".project-case-back");
    const live = pick<HTMLAnchorElement>(screen, ".project-case-live");
    const next = pick<HTMLAnchorElement>(screen, ".project-case-next");

    expect(back.getAttribute("href")).toBe("/projects");
    expect(text(back)).toBe("All projects");
    expect(live.getAttribute("href")).toBe("https://qwixit.com/");
    expect(live.target).toBe("_blank");
    expect(live.rel).toBe("noopener noreferrer");
    expect(text(live)).toBe("Live site");
    expect(getComputedStyle(live).textTransform).toBe("uppercase");
    expect(live.classList.contains("btn")).toBe(true);
    expect(next.getAttribute("href")).toBe(`/projects/${nextOf("qwixit").slug}`);
    expect(text(pick(screen, ".project-case-next-label"))).toBe(
      `Next project · ${nextOf("qwixit").label}`,
    );
    expect(getComputedStyle(pick(screen, ".project-case-next-label")).textTransform).toBe(
      "uppercase",
    );
    expect(text(pick(screen, ".project-case-next-name"))).toBe(qwixit.next.name);
  });

  it.each(projectCases)("renders the case of $header.name", async (item) => {
    const screen = await renderCase({ width: 1440, height: 900, slug: item.slug });
    const { header, next } = item;
    const live = pick<HTMLAnchorElement>(screen, ".project-case-live");

    expect(
      pick(screen, ".project-case").classList.contains(`project-case-tone-${header.tone}`),
    ).toBe(true);
    expect(text(pick(screen, "h1"))).toBe(`${header.name}: ${header.headline}`);
    expect(text(pick(screen, ".project-case-label"))).toBe(`${header.index} · ${header.subtitle}`);
    expect(pickAll(screen, ".project-case-tag").map((tag) => text(tag))).toEqual(item.meta.tags);
    expect(item.meta.stack).toEqual(caseStackOf(item.slug));
    expectStack(screen, item.meta.stack);
    expect(pick(screen, ".project-case-cover [role='img']").getAttribute("aria-label")).toBe(
      item.cover.imageAlt,
    );
    expect(
      pickAll<HTMLImageElement>(screen, ".project-case-shot").every(
        (image) => image.naturalWidth > 0,
      ),
    ).toBe(true);
    expect(pick<HTMLAnchorElement>(screen, ".project-case-next").getAttribute("href")).toBe(
      `/projects/${next.slug}`,
    );
    expect(text(pick(screen, ".project-case-next-label"))).toBe(`Next project · ${next.index}`);
    expect(text(pick(screen, ".project-case-next-name"))).toBe(next.name);
    if (header.url) {
      expect(live.getAttribute("href")).toBe(header.url);
      expect(live.hasAttribute("aria-disabled")).toBe(false);
    } else {
      expect(live.hasAttribute("href")).toBe(false);
      expect(live.getAttribute("aria-disabled")).toBe("true");
      expect(getComputedStyle(live).pointerEvents).toBe("none");
    }
  });

  it("paints the accent of each project", async () => {
    for (const [slug, token] of [
      ["qwixit", "--color-primary-ink"],
      ["brendmart", "--color-secondary-ink"],
      ["tamriel-codex", "--color-accent-ink"],
    ] as const) {
      const screen = await renderCase({ width: 1440, height: 900, slug });
      expect(getComputedStyle(pick(screen, ".project-case-label")).color).toBe(resolve(token));
      expect(getComputedStyle(pick(screen, ".project-case-next-label")).color).not.toBe("");
      screen.unmount();
    }
  });

  it("keeps the interface strings in the site language and the case data in English", async () => {
    const screen = await renderCase({ width: 1440, height: 900 }, "ru");

    expect(text(pick(screen, ".page-sections-nav-title"))).toBe(ru.projects.case.nav);
    expect(text(pick(screen, ".project-case-back"))).toBe(ru.projects.case.back);
    expect(text(pick(screen, ".project-case-live"))).toBe(ru.projects.case.liveSite);
    expect(text(pick(screen, ".project-case-stack-label"))).toBe(`${ru.projects.case.stack}:`);
    expect(text(pick(screen, ".project-case-stack-legend"))).toBe(ru.projects.case.stackOwn);
    expect(text(pick(screen, ".project-case-next-label"))).toBe(
      `${ru.projects.case.next} · ${nextOf("qwixit").label}`,
    );
    expect(text(pick(screen, "h1"))).toBe(`Qwixit: ${qwixit.header.headline}`);
    expect(text(pick(screen, ".page-section-heading"))).toBe(qwixitSections[0]!.name);
  });

  it("renders the whole case and its navigation on the server", async () => {
    const tamrielCodex = projectCases.find((item) => item.slug === "tamriel-codex")!;
    const app = createSSRApp({ render: () => h(ProjectCase, { blocks: tamrielCodexCase }) });
    app.use(createApp("en"));
    const root = document.createElement("div");
    root.innerHTML = await renderToString(app);

    expect(root.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      `Tamriel Codex: ${tamrielCodex.header.headline}`,
    );
    expect(
      [...root.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual([
      "#role",
      "#context",
      "#game",
      "#situation",
      "#goal",
      "#process",
      "#contents",
      "#architecture",
      "#exchange",
      "#mobile",
      "#growth",
      "#security",
      "#quality",
      "#challenges",
      "#vk-data",
      "#rules",
      "#qr-size",
      "#results",
      "#cta",
    ]);
    expect(root.querySelectorAll("h2")).toHaveLength(6);
    expect(root.querySelector(".project-case-next")?.getAttribute("href")).toBe(
      `/projects/${nextOf("tamriel-codex").slug}`,
    );
    expect(root.querySelector(".project-case-live")?.hasAttribute("href")).toBe(false);
  });

  it("counts the sections in the mobile pill", async () => {
    const screen = await renderCase({ width: 390, height: 780 });

    expect(text(pick(screen, ".page-sections-nav-summary"))).toBe(
      `${qwixitSections[0]!.name} · ${qwixitSections.length} sections`,
    );
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
  });
});

describe("layout like the mockup", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("lays out the desktop page in two columns", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const header = rect(screen, "header").height;
    const content = rect(screen, ".page-sections-content");
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".project-case-cover");

    near(header, 70);
    near(content.left, 140);
    near(content.width, 784);
    near(nav.left, 1020);
    near(nav.width, 280);
    near(nav.top, header + 72);
    near(rect(screen, ".project-case-back").top, header + 24);
    near(rect(screen, ".project-case-back").height, 44);
    near(cover.width, 784);
    near(cover.height, 440);
    near(rect(screen, ".project-case-live").height, 44);
    near(size(screen, ".project-case-title"), 52);
    near(size(screen, "#context"), 40);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 24);
    near(size(screen, ".project-case-text"), 16);
    near(size(screen, ".project-case-stat-value"), 34);
    near(size(screen, ".page-sections-nav-title"), 18);
    near(rect(screen, ".project-case-meta").top - cover.bottom, 36);
    near(rect(screen, ".project-case-header").bottom, cover.top - 36);
    near(rect(screen, ".project-case-next").width, 784);
    near(rect(screen, ".project-case-next").height, 98, 2);
    near(document.documentElement.scrollHeight - rect(screen, ".project-case-next").bottom, 96, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  it("lays out the tablet page in one column with the pill on top", async () => {
    const screen = await renderCase({ width: 768, height: 900 });
    const header = rect(screen, "header").height;
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".project-case-cover");

    near(header, 94);
    near(nav.left, 32);
    near(nav.width, 704);
    near(nav.top, header + 28);
    near(rect(screen, ".project-case-back").top, nav.bottom + 12);
    near(cover.width, 704);
    near(cover.height, 400);
    near(size(screen, ".project-case-title"), 44);
    near(size(screen, "#context"), 36);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 22);
    near(size(screen, ".project-case-stat-value"), 32);
    near(rect(screen, ".project-case-meta").top - cover.bottom, 32);
    near(document.documentElement.scrollHeight - rect(screen, ".project-case-next").bottom, 80, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
  });

  it("lays out the mobile page in one column with the pill on top", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const header = rect(screen, "header").height;
    const nav = rect(screen, ".page-sections-nav");
    const cover = rect(screen, ".project-case-cover");

    near(header, 68);
    near(nav.left, 20);
    near(nav.width, 350);
    near(nav.top, header + 28);
    near(rect(screen, ".project-case-back").top, nav.bottom);
    near(cover.width, 350);
    near(cover.height, 240);
    near(size(screen, ".project-case-title"), 32);
    near(size(screen, "#context"), 30);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 20);
    near(size(screen, ".project-case-text"), 14);
    near(size(screen, ".project-case-stat-value"), 28);
    near(rect(screen, ".project-case-meta").top - cover.bottom, 26);
    near(document.documentElement.scrollHeight - rect(screen, ".project-case-next").bottom, 56, 2);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it.each(projectCases)("lays out the case of $slug in two columns at 1440", async (item) => {
    const screen = await renderCase({ width: 1440, height: 900, slug: item.slug });
    const content = rect(screen, ".page-sections-content");
    const nav = rect(screen, ".page-sections-nav");
    const blocks = [
      ".project-case-header",
      ".project-case-cover",
      ".project-case-meta",
      ".project-case-next",
    ].map((selector) => rect(screen, selector));

    near(content.left, 140);
    near(content.width, 784);
    near(nav.left, 1020);
    near(nav.width, 280);
    for (const box of blocks) {
      expect(box.left).toBeGreaterThanOrEqual(content.left - 0.5);
      expect(box.right).toBeLessThanOrEqual(content.right + 0.5);
    }
    for (let index = 1; index < blocks.length; index++) {
      expect(blocks[index]!.top).toBeGreaterThanOrEqual(blocks[index - 1]!.bottom - 0.5);
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  it.each([
    { width: 1440, columns: 2 },
    { width: 768, columns: 2 },
    { width: 390, columns: 2 },
  ])("shows the result cells in $columns column(s) at $width", async ({ width, columns }) => {
    const screen = await renderCase({ width, height: 900 });
    const cells = pickAll(screen, ".project-case-stat").map((cell) => cell.getBoundingClientRect());
    const grid = rect(screen, ".project-case-stats");

    expect(cells).toHaveLength(qwixitStats.length);
    expect(new Set(cells.map((cell) => Math.round(cell.left))).size).toBe(columns);
    expect(new Set(cells.map((cell) => Math.round(cell.top))).size).toBe(
      Math.ceil(qwixitStats.length / columns),
    );
    near(grid.width, rect(screen, ".project-case-results").width - 2);
    for (const cell of cells) near(cell.width, (grid.width - (columns - 1)) / columns);
    near(cells[1]!.left - cells[0]!.right, 1);
    near(cells[columns]!.top - cells[0]!.bottom, 1);
  });

  it("places the laptop and the phone on the cover in proportion to its width", async () => {
    for (const [width, cover, laptop, phone] of [
      [1440, 782, 516, 149],
      [768, 702, 463, 133],
      [390, 348, 230, 66],
    ] as const) {
      const screen = await renderCase({ width, height: 900 });
      const stage = rect(screen, ".project-case-stage");
      const lid = rect(screen, ".project-case-laptop");
      const body = rect(screen, ".project-case-phone");

      near(stage.width, cover);
      near(lid.width, laptop, 1.5);
      near(pick<HTMLElement>(screen, ".project-case-phone").offsetWidth, phone, 1.5);
      near(lid.left - stage.left, (70 / 782) * cover, 1.5);
      expect(body.right).toBeLessThanOrEqual(stage.right);
      expect(body.bottom).toBeLessThanOrEqual(stage.bottom);
      expect(lid.right).toBeLessThan(body.right);
      screen.unmount();
    }
  });

  it("shows the project preview on both devices", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const images = pickAll<HTMLImageElement>(screen, ".project-case-shot");

    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
      expect(getComputedStyle(image).objectFit).toBe("cover");
    }
    const { image, imageMobile } = qwixit.cover;
    expect(image).not.toBeNull();
    expect(imageMobile).not.toBeNull();
    expect(images[0]!.getAttribute("src")).toBe(image!.src);
    expect(images[1]!.getAttribute("src")).toBe(imageMobile!.src);
    expect(images[0]!.src).not.toBe(images[1]!.src);
    expect(getComputedStyle(pick(screen, ".project-case-phone")).transform).not.toBe("none");
  });

  it.each([
    { width: 1440, locale: "en" as const },
    { width: 1024, locale: "en" as const },
    { width: 768, locale: "ru" as const },
    { width: 390, locale: "ru" as const },
    { width: 360, locale: "ru" as const },
  ])("keeps everything inside the screen at $width in $locale", async ({ width, locale }) => {
    const screen = await renderCase({ width, height: 900 }, locale);
    const root = rect(screen, ".project-case");

    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    for (const selector of [
      ".project-case-header",
      ".project-case-cover",
      ".project-case-meta",
      ".project-case-results",
      ".project-case-next",
      ".page-sections-nav",
      ".page-section-heading",
    ]) {
      for (const element of screen.container.querySelectorAll(selector)) {
        const box = element.getBoundingClientRect();
        expect(box.left, selector).toBeGreaterThanOrEqual(root.left - 0.5);
        expect(box.right, selector).toBeLessThanOrEqual(root.right + 0.5);
      }
    }
    for (const part of screen.container.querySelectorAll(".project-case-next-box *")) {
      const box = part.getBoundingClientRect();
      expect(box.right).toBeLessThanOrEqual(rect(screen, ".project-case-next-box").right + 0.5);
    }
  });
});

describe("theme", () => {
  it.each([
    { theme: "torii-synth", radius: 0, cut: 14, tagRadius: 0, tagCut: 5 },
    { theme: "cyber-sakura", radius: 18, cut: 0, tagRadius: 32, tagCut: 0 },
  ])("draws the $theme shapes", async ({ theme, radius, cut, tagRadius, tagCut }) => {
    setTheme(theme);
    const screen = await renderCase({ width: 1440, height: 900 });
    const cover = getComputedStyle(pick(screen, ".project-case-cover"));
    const tag = getComputedStyle(pick(screen, ".project-case-tag"));

    near(Number.parseFloat(cover.borderTopLeftRadius), radius);
    near(Number.parseFloat(cover.clipPath.slice(8)), cut);
    near(Number.parseFloat(tag.borderTopLeftRadius), tagRadius);
    near(Number.parseFloat(tag.clipPath.slice(8)), tagCut);
    expect(
      getComputedStyle(pick(screen, ".project-case-results")).clipPath.startsWith("polygon("),
    ).toBe(true);
    expect(
      getComputedStyle(pick(screen, ".project-case-next")).clipPath.startsWith("polygon("),
    ).toBe(true);
  });

  it("turns the grid and the glow of the stage with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderCase({ width: 1440, height: 900 });
    const stage = pick(screen, ".project-case-stage");
    const dark = getComputedStyle(stage).backgroundColor;
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    expect(transitioning(stage, "background-color")).toBe(true);
    expect(transitioning(stage, "--project-case-stage-glow")).toBe(true);
    expect(transitioning(pick(screen, ".project-case-grid"), "--project-case-grid-line")).toBe(
      true,
    );
    expect(transitioning(pick(screen, ".project-case-cover"), "--project-case-shot-from")).toBe(
      true,
    );
    expect(transitioning(pick(screen, ".project-case-cover"), "clip-path")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(stage).backgroundColor).not.toBe(dark);
  });

  it("does not transition with reduced motion", async () => {
    await setReducedMotion("reduce");
    setTheme("torii-synth");
    const screen = await renderCase({ width: 1440, height: 900 });
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const targets = [
      ".project-case-cover",
      ".project-case-stage",
      ".project-case-grid",
      ".project-case-tag",
      ".project-case-results",
      ".project-case-stats",
      ".project-case-next",
      ".project-case-next-box",
    ].map((selector) => pick(screen, selector));
    expect(
      document.getAnimations().filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        return animation instanceof CSSTransition && targets.includes(effect?.target as Element);
      }),
    ).toHaveLength(0);
  });
});

describe("state animations", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("moves the next project arrow and fills the frame on hover", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const next = pick(screen, ".project-case-next");
    const icon = pick(screen, ".project-case-next-icon");
    const line = getComputedStyle(next).backgroundColor;

    next.scrollIntoView({ block: "center" });
    await userEvent.hover(next);
    expect(transitioning(next, "background-color")).toBe(true);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(next).backgroundColor).not.toBe(line);
    expect(getComputedStyle(icon).translate).not.toBe("none");
    expect(Number.parseFloat(getComputedStyle(icon).translate)).toBeGreaterThan(0);
  });

  it("changes the color of the back link and moves its arrow on hover", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const back = pick(screen, ".project-case-back");
    const icon = pick(screen, ".project-case-back-icon");
    const idle = getComputedStyle(back).color;

    await userEvent.hover(back);
    expect(transitioning(back, "color")).toBe(true);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(back).color).not.toBe(idle);
    expect(Number.parseFloat(getComputedStyle(icon).translate)).toBeLessThan(0);
  });

  it("lights the live site link on hover", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const live = pick(screen, ".project-case-live");
    const icon = pick(screen, ".project-case-live-icon");
    const idle = getComputedStyle(live).color;

    await userEvent.hover(live);
    expect(transitioning(live, "color")).toBe(true);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(live).color).not.toBe(idle);
  });

  it("opens the mobile list over the case without moving the content", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const before = rect(screen, ".project-case-header").top;

    pick<HTMLButtonElement>(screen, ".page-sections-nav-head").click();
    await nextTick();
    finishAnimations();

    expect(rect(screen, ".project-case-header").top).toBe(before);
    expect(getComputedStyle(pick(screen, ".page-sections-nav-panel")).visibility).toBe("visible");
    expect(pick(screen, ".page-sections-nav-head").getAttribute("aria-expanded")).toBe("true");
  });

  it("follows the chapters while scrolling", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const anchors = () => pickAll(screen, ".page-sections-nav-link");
    const current = () =>
      text(anchors().find((link) => link.getAttribute("aria-current") === "location"));
    const nameOf = (id: string) => qwixitSections.find((section) => section.id === id)!.name;
    const scrollTo = (id: string) =>
      window.scrollTo({
        top: document.getElementById(id)!.getBoundingClientRect().top + window.scrollY - 102,
        behavior: "instant",
      });

    scrollTo("integrations");
    await expect.poll(current).toBe(nameOf("integrations"));
    scrollTo("situation");
    await expect.poll(current).toBe(nameOf("situation"));
    window.scrollTo({ top: 0, behavior: "instant" });
    await expect.poll(current).toBe(qwixitSections[0]!.name);
  });
});
