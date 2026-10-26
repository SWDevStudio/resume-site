import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import TheHeader from "~/components/global/TheHeader/TheHeader.vue";
import { buildProjects, buildResume } from "~/assets/api/mock/build";
import { staticSources } from "~/assets/api/mock/sources.static";
import type { ResumeData } from "~/assets/api/types/resume";
import Resume from "./Resume.vue";
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

const resumeData: ResumeData = buildResume(staticSources("en"), "en");
const ruData: ResumeData = buildResume(staticSources("ru"), "ru");

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

async function renderResume(
  item: Pick<View, "width" | "height">,
  locale: Locale = "en",
  data: ResumeData = resumeData,
) {
  await page.viewport(item.width, item.height);
  document.documentElement.lang = locale;
  const screen = await render(
    () =>
      h("div", { class: "bg-base-100 font-body text-base-content" }, [
        h(TheHeader),
        h("main", null, h(Resume, { data })),
      ]),
    { global: { plugins: [createApp(locale)] } },
  );
  await nextTick();
  screen.container.getBoundingClientRect();
  return screen;
}

type Screen = Awaited<ReturnType<typeof renderResume>>;

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Michael Surname Summary Qwixit");
  await document.fonts.load('700 1em "Montserrat Alternates"', "На этой странице");
  await document.fonts.load('300 1em "Martian Mono"', "CURRICULUM VITAE 01 — SUMMARY");
  await document.fonts.load('400 1em "Martian Mono"', "DOWNLOAD PDF Application Development");
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

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function visibleText(element: Element) {
  return (element as HTMLElement).innerText.replace(/\s+/g, " ").trim();
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function rect(screen: Screen, selector: string) {
  return pick(screen, selector).getBoundingClientRect();
}

function style(screen: Screen, selector: string, pseudo?: string) {
  return getComputedStyle(pick(screen, selector), pseudo);
}

function size(screen: Screen, selector: string) {
  return Number.parseFloat(style(screen, selector).fontSize);
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

function jump(id: string) {
  const heading = document.getElementById(id)!;
  const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop);
  window.scrollTo({
    top: heading.getBoundingClientRect().top + window.scrollY - margin,
    behavior: "instant",
  });
}

const sectionKeys = [
  "summary",
  "skills",
  "projects",
  "experience",
  "education",
  "additional",
  "ai",
  "personal",
  "references",
] as const;

function navEntries(data: ResumeData) {
  return sectionKeys.flatMap((key) => {
    const section = data[key];
    const own = [{ id: section.id, name: section.name, depth: 0 }];
    if (key !== "experience") return own;
    return [
      ...own,
      ...data.experience.jobs.map((job) => ({
        id: job.id,
        name: `${job.company} — ${job.title}`,
        depth: 1,
      })),
    ];
  });
}

const navNames = navEntries(resumeData).map((item) => item.name);
const navIds = navEntries(resumeData).map((item) => item.id);

describe("content", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("renders the heading block from the data", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const { profile } = resumeData;

    expect(pick(screen, ".resume").classList.contains("page-sections")).toBe(true);
    expect(pick(screen, ".resume").classList.contains("container")).toBe(true);
    expect(pickAll(screen, "h1")).toHaveLength(1);
    expect(text(pick(screen, ".resume-caption"))).toBe("CURRICULUM VITAE · UPDATED OCTOBER 2026");
    expect(text(pick(screen, "h1"))).toBe("Michael Malakhov");
    expect(visibleText(pick(screen, ".resume-role"))).toBe(
      "Fullstack Developer (Vue.js / React / TypeScript) — Programmer, developer",
    );
    expect(profile.firstName).toBe("Michael");
    const stack = pick(screen, ".resume-role-stack");
    expect(text(stack)).toBe("(Vue.js / React / TypeScript)");
    expect(stack.getAttribute("lang")).toBe("en");
    expect(stack.hasAttribute("data-atom-skip")).toBe(true);
    expect(getComputedStyle(stack).fontFamily).toContain("Righteous");
  });

  it("renders the contacts with safe links", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const labels = pickAll(screen, ".resume-contacts-label").map((item) => text(item));
    const values = pickAll(screen, ".resume-contacts-value");

    expect(labels).toEqual(["Telegram", "Email", "Personal", "Citizenship", "Relocation"]);
    expect(values.map((item) => text(item))).toEqual([
      "@kotaroSWQ",
      "swdevstudio@gmail.com",
      "Male, 27 years old, born 28 April 1999",
      "Russia, work permit: Russia",
      "Willing to relocate, willing to travel for work",
    ]);
    const anchors = values.slice(0, 2).map((item) => item.querySelector("a")!);
    expect(anchors.map((link) => link.getAttribute("href"))).toEqual([
      "https://t.me/kotaroSWQ",
      "mailto:swdevstudio@gmail.com",
    ]);
    for (const link of anchors) expect(link.rel).toBe("noopener noreferrer");
    expect(anchors.map((link) => link.getAttribute("target"))).toEqual(["_blank", null]);
    for (const value of values.slice(2)) expect(value.querySelector("a")).toBeNull();
  });

  it("renders the download buttons as links to the resume files of the site language", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const buttons = pickAll<HTMLAnchorElement>(screen, ".resume-action");

    expect(buttons.map((item) => item.getAttribute("href"))).toEqual([
      "/resume/en.pdf",
      "/resume/en.md",
    ]);
    expect(buttons.map((item) => item.hasAttribute("download"))).toEqual([true, false]);
    for (const button of buttons) {
      expect(button.target).toBe("_blank");
      expect(button.rel).toBe("noopener noreferrer");
      expect(button.classList.contains("btn")).toBe(true);
      expect(button.querySelector(".btn-frame")).not.toBeNull();
      expect(getComputedStyle(button).textTransform).toBe("uppercase");
    }
    expect(buttons.map((item) => visibleText(item))).toEqual(["DOWNLOAD PDF", "FOR LLM · MD"]);
    expect(buttons[0]!.classList.contains("resume-action-pdf")).toBe(true);
    expect(getComputedStyle(buttons[0]!).getPropertyValue("--btn-color").trim()).not.toBe(
      getComputedStyle(buttons[1]!).getPropertyValue("--btn-color").trim(),
    );
  });

  it("shows the short button labels on the phone", async () => {
    const screen = await renderResume({ width: 390, height: 780 });

    expect(pickAll(screen, ".resume-action").map((item) => visibleText(item))).toEqual([
      "PDF",
      "LLM · MD",
    ]);
  });

  it("numbers every section and draws the rule under its heading", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const roots = pickAll(screen, ".page-section-root");

    expect(roots).toHaveLength(9);
    expect(pickAll(screen, ".page-section-label").map((item) => text(item))).toEqual([
      "01 — SUMMARY",
      "02 — SKILLS",
      "03 — PROJECTS",
      "04 — EXPERIENCE",
      "05 — EDUCATION",
      "06 — ADDITIONAL",
      "07 — AI TOOLS",
      "08 — PERSONAL",
      "09 — REFERENCES",
    ]);
    expect(pickAll(screen, ".page-section-rule")).toHaveLength(9);
    for (const root of roots) {
      expect(root.children[0]!.classList.contains("page-section-label")).toBe(true);
      expect(root.children[1]!.classList.contains("page-section-heading")).toBe(true);
      expect(root.children[2]!.classList.contains("page-section-rule")).toBe(true);
    }
  });

  it("renders every section and job of the data with its heading level and id", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const headings = pickAll<HTMLElement>(screen, ".page-section-heading");

    expect(
      headings.map(
        (heading) =>
          `${heading.tagName} ${heading.childNodes[0]!.textContent?.trim()} #${heading.id}`,
      ),
    ).toEqual([
      "H2 Summary #summary",
      "H2 Technical Skills #skills",
      "H2 Selected Projects #projects",
      "H2 Work Experience #experience",
      "H3 Freedom International Group — IT Team Lead (Frontend) #freedom",
      "H3 Brendmart — Senior Frontend Developer #brendmart",
      "H3 Pochtoy.com LLC — Senior Frontend Developer #pochtoy",
      "H3 CDEK.Market — Frontend Developer #cdek-market",
      "H3 To The Moon Mobile Ltd — Frontend Developer #to-the-moon",
      "H3 Amigoweb — Junior Frontend Developer #amigoweb",
      "H2 Education #education",
      "H2 Additional Information #additional",
      "H2 AI Tools in Development #ai",
      "H2 Personal Projects #personal",
      "H2 References #references",
    ]);
    expect(pickAll(screen, ".page-section-level-4")).toHaveLength(0);
  });

  it("renders the about me paragraphs", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const section = pick(screen, "section[aria-labelledby='summary']");
    const paragraphs = [...section.querySelectorAll(".resume-text")].map((item) => text(item));

    expect(paragraphs).toEqual(resumeData.summary.paragraphs);
    expect(paragraphs).toHaveLength(5);
    expect(paragraphs[0]).toBe(
      "Frontend developer and team lead with 7+ years of commercial experience building product web applications on Vue.js/Nuxt and React/Next.js (SPA + SSR).",
    );
    expect(section.querySelectorAll("[data-atom-skip]")).toHaveLength(0);
  });

  it("renders the skill groups with English terms", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const section = pick(screen, "section[aria-labelledby='skills']");
    const rows = [...section.querySelectorAll(".resume-list-item")];

    expect(rows.map((item) => text(item.querySelector(".resume-list-lead")))).toEqual([
      "Frontend:",
      "Backend & DevOps:",
      "Lead & soft skills:",
      "Additional:",
    ]);
    expect(text(rows[1])).toBe(
      "Backend & DevOps: Node.js, NestJS, Laravel, Rust, PostgreSQL, SQL, MongoDB, Redis, REST API, JSON, Docker, Kubernetes, Terraform, Nginx, CI/CD, GitHub Actions",
    );
    expect(text(rows[2])).toContain("Lead & soft skills: Team management, Team leadership");
    expect(text(rows[3])).toContain("Additional: Vite, Webpack, Git, GitHub, GitLab, Figma, Sass");
    expect(text(rows[3])).toContain("Claude Code, Codex, Gemini, MCP, Atlassian Rovo");
    expect(text(rows[3])).toMatch(/GitHub Copilot, LLM$/);
    expect(text(rows[0])).toContain("JavaScript (ES6+), TypeScript, HTML5, CSS3, SCSS, Vue.js");
    const terms = section.querySelectorAll("[data-atom-skip]");
    expect(terms).toHaveLength(6);
    expect(rows[2]!.querySelector("[data-atom-skip]")).toBeNull();
    for (const term of terms) expect(term.getAttribute("lang")).toBe("en");
  });

  it("renders the portfolio projects with links, tags and English names", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const cards = pickAll(screen, "section[aria-labelledby='projects'] .resume-project");

    const sources = staticSources("en");
    const projects = buildProjects(sources, "en");

    expect(cards).toHaveLength(projects.length);
    expect(cards.map((card) => text(card.querySelector("h3")))).toEqual(
      projects.map((project) => `${project.index} ${project.name}`),
    );
    expect(cards.map((card) => text(card.querySelector(".resume-project-subtitle")))).toEqual(
      projects.map((project) => project.subtitle),
    );
    expect(
      cards.map((card) =>
        [...card.querySelectorAll(".resume-project-tag")].map((tag) => text(tag)),
      ),
    ).toEqual(projects.map((project) => project.tags));
    expect(
      cards.map((card) =>
        [...card.querySelectorAll(".resume-list-item")].map((item) => text(item)),
      ),
    ).toEqual(projects.map((project) => [project.role, project.result]));
    for (const card of cards) {
      expect(card.querySelectorAll(".resume-list-item")).toHaveLength(2);
      const name = card.querySelector(".resume-project-name")!;
      expect(name.getAttribute("lang")).toBe("en");
      expect(name.hasAttribute("data-atom-skip")).toBe(true);
      expect(getComputedStyle(name).fontFamily).toContain("Righteous");
    }
    const links = cards.map((card) => card.querySelector<HTMLAnchorElement>(".resume-link")!);
    expect(links.map((link) => text(link))).toEqual(
      projects.map((project) => project.host ?? sources.projectsText.en!.linkPlaceholder),
    );
    projects.forEach((project, position) => {
      const link = links[position]!;

      if (project.url) {
        expect(link.getAttribute("href")).toBe(project.url);
        expect(link.target).toBe("_blank");
        expect(link.rel).toBe("noopener noreferrer");
      } else {
        expect(link.hasAttribute("href")).toBe(false);
      }
    });
  });

  it("renders the six jobs with their periods, teams, lists and stacks", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const jobs = pickAll(screen, ".page-section-level-3");

    expect(
      text(pick(screen, "section[aria-labelledby='experience'] > .page-section-body > p")),
    ).toBe("Total experience: 7 years 6 months");
    expect(jobs).toHaveLength(6);
    expect(jobs.map((job) => text(job.querySelector(".page-section-meta")))).toEqual([
      "March 2026 — present · Moscow",
      "January 2025 — March 2026 · Bishkek",
      "October 2023 — January 2025 · Moscow",
      "October 2021 — October 2023 · Novosibirsk",
      "April 2021 — October 2021 · Moscow",
      "April 2019 — April 2021 · Magnitogorsk",
    ]);
    const first = jobs[0]!;
    expect([...first.querySelectorAll(".resume-block-title")].map((title) => text(title))).toEqual([
      "Projects",
      "Responsibilities",
      "Achievements",
      "Stack and technologies",
    ]);
    expect(first.querySelectorAll(".resume-block")[0]!.querySelectorAll("li")).toHaveLength(2);
    expect(text(first.querySelector(".resume-block li"))).toBe(
      "dobro.ru: web platform on React 19 + Next.js.",
    );
    expect(text(first.querySelectorAll(".resume-text")[0])).toBe(
      "Financial sector, investment company (development of the group's portfolio products) · freedomgroupint.com",
    );
    expect(text(first.querySelectorAll(".resume-text")[1])).toBe(
      "Team: 4 frontend (direct reports), 5 backend, 3 designers, 2 QA, 1 product",
    );
    expect(first.querySelector<HTMLAnchorElement>(".resume-link")!.href).toBe(
      "https://freedomgroupint.com/",
    );
    expect(first.querySelectorAll(".resume-block")[1]!.querySelectorAll("li")).toHaveLength(8);
    expect(first.querySelectorAll(".resume-block")[2]!.querySelectorAll("li")).toHaveLength(5);
    for (const job of jobs) {
      const stack = job.querySelector(".resume-block:last-child [data-atom-skip]")!;
      expect(stack.getAttribute("lang")).toBe("en");
    }
    const pochtoy = jobs[2]!;
    expect(text(pochtoy.querySelector(".resume-block:last-child .resume-text"))).toBe(
      "Vue.js (Vue 3), React, JavaScript (ES6+), TypeScript, jQuery, Laravel (Blade), Webpack, REST API, DevTools, data adaptation and normalization, legacy refactoring",
    );
    expect(pochtoy.querySelectorAll(".resume-block:last-child [data-atom-skip]")).toHaveLength(1);
    expect(jobs[3]!.querySelector(".resume-link")).toBeNull();
    expect(jobs[4]!.querySelectorAll(".resume-block")).toHaveLength(3);
  });

  it("renders education, additional information, AI tools, personal project and references", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const items = (id: string) =>
      [
        ...pick(screen, `section[aria-labelledby='${id}']`).querySelectorAll(".resume-list-item"),
      ].map((item) => text(item));

    expect(items("education")).toEqual([
      "Higher education: RSSU, 2023 Faculty of Political and Social Technologies, degree in Information Systems and Technologies in Economics",
      "Secondary: Mayskaya School, 2017",
    ]);
    expect(items("additional")).toEqual([
      "Languages: Russian: native. English: A2 (spoken). Read technical documentation, specifications and English-language sources fluently.",
      "Employment type: full-time, part-time, project work / one-off assignment.",
      "Work format: remote, hybrid, on-site.",
      "Preferred commute time: does not matter.",
      "Driving: Own car. Category B licence.",
    ]);
    expect(items("references")).toEqual([
      "FIX PRICE: Roman Khadzhaev (Senior Frontend Developer)",
      "CDEK.Market: Roman Olennikov (team lead)",
    ]);
    expect(
      [...pick(screen, "section[aria-labelledby='ai']").querySelectorAll(".resume-text")].map(
        (item) => text(item),
      ),
    ).toEqual(resumeData.ai.paragraphs);
    const personal = pick(screen, "section[aria-labelledby='personal'] .resume-project");
    expect(text(personal.querySelector("h3"))).toBe(
      "Desktop application for working with ESP32 devices",
    );
    expect(text(personal.querySelector(".resume-project-subtitle"))).toBe(
      "Tauri (Rust + Vue/TypeScript)",
    );
    expect(text(personal.querySelector(".resume-text"))).toBe(
      resumeData.personal.items[0]!.description,
    );
    expect(personal.querySelector("[data-atom-skip]")!.getAttribute("lang")).toBe("en");
  });

  it("renders the footer with the back to top link", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });

    expect(text(pick(screen, ".resume-footer span"))).toBe("© 2026 Michael Malakhov · SOWA_DEV");
    expect(pick(screen, ".resume-footer-top").getAttribute("href")).toBe("#top");
    expect(visibleText(pick(screen, ".resume-footer-top"))).toBe("BACK TO TOP");
  });

  it("builds the page navigation from the sections and the jobs", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const anchors = pickAll<HTMLAnchorElement>(screen, ".page-sections-nav-link");

    expect(anchors.map((link) => text(link))).toEqual(navNames);
    expect(anchors.map((link) => link.getAttribute("href"))).toEqual(navIds.map((id) => `#${id}`));
    expect(text(pick(screen, ".page-sections-nav-title"))).toBe("On this page");
    expect(text(anchors.find((link) => link.getAttribute("aria-current")))).toBe("Summary");
    expect(anchors.map((link) => link.style.getPropertyValue("--page-sections-depth"))).toEqual(
      navEntries(resumeData).map((item) => String(item.depth)),
    );
    expect(navIds).toHaveLength(15);
  });

  it("counts only the sections of the first level in the phone pill", async () => {
    const screen = await renderResume({ width: 390, height: 780 });

    expect(text(pick(screen, ".page-sections-nav-summary"))).toBe("Summary · 9 sections");
  });

  it("renders the Russian data with the Russian interface and English terms", async () => {
    const screen = await renderResume({ width: 1440, height: 900 }, "ru", ruData);

    expect(text(pick(screen, ".page-sections-nav-title"))).toBe(ru.resume.nav);
    for (const label of pickAll(screen, ".resume-contacts-label")) {
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
    }
    expect(visibleText(pick(screen, ".resume-footer-top"))).toBe(ru.footer.top.toUpperCase());
    expect(text(pick(screen, "h1"))).toBe("Михаил Малахов");
    expect(text(pick(screen, ".page-section-heading"))).toBe("Обо мне");
    expect(pickAll(screen, ".page-section-label").map((item) => text(item))[0]).toBe(
      "01 — ОБО МНЕ",
    );
    expect(text(pick(screen, ".resume-role-stack"))).toBe("(Vue.js / React / TypeScript)");
    const rows = [
      ...pick(screen, "section[aria-labelledby='skills']").querySelectorAll(".resume-list-item"),
    ];
    expect(rows).toHaveLength(4);
    expect(rows[0]!.querySelector(".resume-list-lead")!.getAttribute("lang")).toBe("en");
    expect(text(rows[2]!.querySelector(".resume-list-lead"))).toBe("Лидерство и soft skills:");
    expect(text(rows[2])).toContain("Управление командой");
    expect(rows[2]!.querySelector("[lang]")).toBeNull();
    expect(rows[2]!.querySelector("[data-atom-skip]")).toBeNull();
    expect(rows[3]!.querySelector(".resume-list-lead")!.getAttribute("lang")).toBe("en");
    expect(
      pickAll(screen, ".page-sections-nav-link").map((link) => link.getAttribute("href")),
    ).toEqual(navIds.map((id) => `#${id}`));
    const job = pick(screen, ".page-section-level-3");
    expect(text(job.querySelector(".page-section-heading"))).toContain(
      "Freedom International Group — Руководитель группы разработки",
    );
    expect(text(job.querySelector(".page-section-meta"))).toBe(
      "Март 2026 — настоящее время · Москва",
    );
  });

  it("renders the whole page and its navigation on the server", async () => {
    const app = createSSRApp({ render: () => h(Resume, { data: resumeData }) });
    app.use(createApp("en"));
    const root = document.createElement("div");
    root.innerHTML = await renderToString(app);

    expect(root.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Michael Malakhov",
    );
    expect(
      [...root.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual(navIds.map((id) => `#${id}`));
    expect(root.querySelectorAll("h2")).toHaveLength(9);
    expect(root.querySelectorAll(".page-section-level-3")).toHaveLength(6);
    expect(root.querySelector(".resume-action")?.getAttribute("href")).toBe("/resume/en.pdf");
  });

  it("passes the async block attribute to the root of the page", async () => {
    await page.viewport(1440, 900);
    const screen = await render(
      () => h(Resume, { data: resumeData, "data-atom-async": "resume" }),
      { global: { plugins: [createApp("en")] } },
    );

    expect(screen.container.querySelectorAll("[data-atom-async='resume']")).toHaveLength(1);
    expect(
      screen.container.querySelector("[data-atom-async='resume']")!.classList.contains("resume"),
    ).toBe(true);
    expect(
      screen.container
        .querySelector("[data-atom-async='resume']")!
        .querySelector(".page-sections-nav"),
    ).not.toBeNull();
  });
});

describe("data change", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("rebuilds the headings, the navigation and the anchors when the data changes", async () => {
    await page.viewport(1440, 900);
    const data = ref<ResumeData>(resumeData);
    const screen = await render(() => h("main", null, h(Resume, { data: data.value })), {
      global: { plugins: [createApp("en")] },
    });
    const links = () =>
      [...screen.container.querySelectorAll(".page-sections-nav-link")].map((link) => text(link));

    expect(links()).toEqual(navNames);
    data.value = ruData;
    await nextTick();
    await nextTick();

    expect(links()).toEqual(navEntries(ruData).map((item) => item.name));
    expect(text(screen.container.querySelector("h1"))).toBe("Михаил Малахов");
    expect(screen.container.querySelectorAll(".page-section-root")).toHaveLength(9);
    expect(
      [...screen.container.querySelectorAll(".page-sections-nav-link")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual(navIds.map((id) => `#${id}`));
  });
});

describe("layout like the mockup", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("lays out the desktop page in two columns", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const header = rect(screen, "header").height;
    const content = rect(screen, ".page-sections-content");
    const nav = rect(screen, ".page-sections-nav");
    const buttons = pickAll(screen, ".resume-action").map((item) => item.getBoundingClientRect());
    const dl = rect(screen, ".resume-contacts");

    near(header, 70);
    near(content.left, 140);
    near(content.width, 784);
    near(nav.left, 1020);
    near(nav.width, 280);
    near(nav.top, header + 72);
    expect(style(screen, ".page-sections-nav").position).toBe("sticky");
    near(Number.parseFloat(style(screen, ".page-sections-nav").top), 96);
    near(rect(screen, ".resume-caption").top, header + 48);
    near(rect(screen, "h1").top, header + 87.6);
    near(size(screen, "h1"), 64);
    near(size(screen, ".resume-role"), 20);
    near(size(screen, ".resume-caption"), 12);
    near(buttons[0]!.height, 52);
    near(buttons[1]!.left - buttons[0]!.right, 14);
    near(rect(screen, ".resume-contacts-value").left - dl.left, 144);
    near(size(screen, ".resume-contacts-value"), 14);
    near(size(screen, ".resume-contacts-label"), 12);
    near(rect(screen, ".resume-contacts-label").width, 120);
    near(rect(screen, ".page-section-label").top - dl.bottom, 64);
    near(size(screen, ".page-section-label"), 12);
    near(size(screen, ".page-section-root > .page-section-heading"), 34);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 22);
    near(size(screen, ".resume-block-title"), 14);
    near(size(screen, ".resume-text"), 16);
    near(size(screen, ".resume-project-title"), 22);
    near(size(screen, ".resume-project-subtitle"), 12);
    near(size(screen, ".resume-project-index"), 14);
    near(size(screen, ".page-sections-nav-title"), 18);
    near(
      rect(screen, ".page-section-heading").top - rect(screen, ".page-section-label").bottom,
      10,
    );
    near(rect(screen, ".page-section-rule").top - rect(screen, ".page-section-heading").bottom, 16);
    near(rect(screen, ".page-section-rule").height, 1);
    near(rect(screen, ".resume-project").left, 140);
    near(Number.parseFloat(style(screen, ".resume-project").borderLeftWidth), 2);
    near(Number.parseFloat(style(screen, ".resume-project").paddingLeft), 20);
    near(
      rect(screen, ".resume-project:nth-child(2)").top - rect(screen, ".resume-project").bottom,
      28,
    );
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1440);
  });

  it("lays out the tablet page in one column with the pill on top", async () => {
    const screen = await renderResume({ width: 768, height: 900 });
    const header = rect(screen, "header").height;
    const nav = rect(screen, ".page-sections-nav");
    const buttons = pickAll(screen, ".resume-action").map((item) => item.getBoundingClientRect());

    near(header, 94);
    near(nav.left, 32);
    near(nav.width, 704);
    near(nav.top, header + 28);
    near(nav.height, 69, 2);
    near(rect(screen, ".resume-caption").top, nav.bottom + 24);
    near(size(screen, "h1"), 52);
    near(size(screen, ".resume-role"), 20);
    near(size(screen, ".page-section-root > .page-section-heading"), 30);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 22);
    near(size(screen, ".resume-text"), 16);
    near(buttons[0]!.height, 52);
    near(buttons[1]!.left - buttons[0]!.right, 14);
    near(buttons[0]!.top, buttons[1]!.top);
    near(rect(screen, ".resume-contacts-label").width, 120);
    near(rect(screen, ".resume-contacts-value").left - rect(screen, ".resume-contacts").left, 144);
    near(rect(screen, ".page-section-label").top - rect(screen, ".resume-contacts").bottom, 56);
    near(rect(screen, ".resume-footer").width, 704);
    near(document.documentElement.scrollHeight - rect(screen, ".resume-footer").bottom, 0, 2);
    near(Number.parseFloat(style(screen, ".resume-footer").paddingBottom), 40);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
  });

  it("lays out the mobile page in one column with the pill on top", async () => {
    const screen = await renderResume({ width: 390, height: 780 });
    const header = rect(screen, "header").height;
    const nav = rect(screen, ".page-sections-nav");
    const buttons = pickAll(screen, ".resume-action").map((item) => item.getBoundingClientRect());
    const value = rect(screen, ".resume-contacts-value");
    const label = rect(screen, ".resume-contacts-label");

    near(header, 92);
    near(nav.left, 20);
    near(nav.width, 350);
    near(nav.top, header + 28);
    near(rect(screen, ".resume-caption").top, nav.bottom + 8);
    near(size(screen, "h1"), 40);
    near(size(screen, ".resume-role"), 18);
    near(size(screen, ".page-section-root > .page-section-heading"), 26);
    near(size(screen, ".page-section-level-3 > .page-section-heading"), 20);
    near(size(screen, ".resume-text"), 14);
    near(buttons[0]!.height, 48);
    near(buttons[0]!.width, 169);
    near(buttons[1]!.width, 169);
    near(buttons[1]!.left - buttons[0]!.right, 12);
    expect(value.top).toBeGreaterThan(label.bottom - 1);
    near(value.left, label.left);
    near(rect(screen, ".page-section-label").top - rect(screen, ".resume-contacts").bottom, 48);
    near(Number.parseFloat(style(screen, ".resume-footer").paddingBottom), 32);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it("keeps the navigation panel at the same top while scrolling", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const header = rect(screen, "header").height;

    near(rect(screen, ".page-sections-nav").top, header + 72);
    window.scrollTo({ top: 1500, behavior: "instant" });
    await nextTick();
    near(rect(screen, ".page-sections-nav").top, 96);
    expect(rect(screen, ".page-sections-nav").bottom).toBeLessThanOrEqual(900);
  });

  it.each([1440, 1024, 768, 390, 360])(
    "keeps everything inside the screen at %i",
    async (width) => {
      const screen = await renderResume(
        { width, height: 900 },
        width < 800 ? "ru" : "en",
        width < 800 ? ruData : resumeData,
      );
      const root = rect(screen, ".resume");

      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      for (const selector of [
        ".resume-header",
        ".resume-action",
        ".resume-contacts",
        ".resume-project",
        ".resume-footer",
        ".page-sections-nav",
        ".page-section-heading",
      ]) {
        for (const element of screen.container.querySelectorAll(selector)) {
          const box = element.getBoundingClientRect();
          expect(box.left, selector).toBeGreaterThanOrEqual(root.left - 0.5);
          expect(box.right, selector).toBeLessThanOrEqual(root.right + 0.5);
        }
      }
    },
  );

  it("scales the layout with the window above the mockup size", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const base = rect(screen, ".resume-action").height;

    await page.viewport(1800, 1125);
    screen.container.getBoundingClientRect();
    near(rect(screen, ".resume-action").height / base, 1.25, 0.02);
    near(size(screen, "h1"), 80, 0.5);
  });
});

describe("theme", () => {
  it.each([
    { theme: "torii-synth", width: 9, height: 3, tagRadius: 0, tagCut: 5, bar: 0 },
    { theme: "cyber-sakura", width: 6, height: 6, tagRadius: 32, tagCut: 0, bar: 3 },
  ])(
    "draws the $theme markers, tags and rule",
    async ({ theme, width, height, tagRadius, tagCut, bar }) => {
      setTheme(theme);
      const screen = await renderResume({ width: 1440, height: 900 });
      const marker = style(screen, ".resume-list-item", "::before");
      const tag = style(screen, ".resume-project-tag");
      const rule = style(screen, ".page-section-rule", "::before");

      near(Number.parseFloat(marker.width), width);
      near(Number.parseFloat(marker.height), height);
      near(Number.parseFloat(marker.top), 0.78 * 16, 0.5);
      expect(marker.transform === "none").toBe(theme === "cyber-sakura");
      near(Number.parseFloat(tag.borderTopLeftRadius), tagRadius);
      near(Number.parseFloat(tag.clipPath.slice(8)), tagCut);
      near(Number.parseFloat(rule.borderTopLeftRadius), bar);
      near(Number.parseFloat(rule.width), 56);
      near(Number.parseFloat(rule.height), 3);
      expect(tag.clipPath.startsWith("polygon(")).toBe(true);
    },
  );

  it("paints the accents with the theme colors", async () => {
    setTheme("torii-synth");
    const screen = await renderResume({ width: 1440, height: 900 });
    const caption = style(screen, ".resume-caption").color;
    const dark = style(screen, ".resume-project-tag").borderTopColor;
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");
    finishAnimations();

    expect(style(screen, ".resume-caption").color).not.toBe(caption);
    expect(style(screen, ".resume-project-tag").borderTopColor).not.toBe(dark);
  });

  it("turns the shapes and the markers with the theme", async () => {
    setTheme("torii-synth");
    const screen = await renderResume({ width: 1440, height: 900 });
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    expect(transitioning(pick(screen, ".resume-project-tag"), "clip-path")).toBe(true);
    expect(transitioning(pick(screen, ".resume-project-tag"), "border-top-left-radius")).toBe(true);
    expect(transitioning(pick(screen, ".resume-list-item"), "width", "::before")).toBe(true);
    expect(transitioning(pick(screen, ".resume-list-item"), "transform", "::before")).toBe(true);
    expect(
      transitioning(pick(screen, ".page-section-rule"), "border-top-left-radius", "::before"),
    ).toBe(true);
    expect(transitioning(pick(screen, ".resume-link"), "text-decoration-color")).toBe(true);
    finishAnimations();
    expect(style(screen, ".resume-project-tag").clipPath.startsWith("polygon(")).toBe(true);
  });

  it("does not transition with reduced motion", async () => {
    await setReducedMotion("reduce");
    setTheme("torii-synth");
    const screen = await renderResume({ width: 1440, height: 900 });
    screen.container.getBoundingClientRect();
    setTheme("cyber-sakura");

    const own = [
      ".resume-project-tag",
      ".resume-link",
      ".resume-action",
      ".resume-footer-top",
      ".resume-footer-icon",
    ].map((selector) => pick(screen, selector));
    const pseudo = [".resume-list-item", ".page-section-rule"].map((selector) =>
      pick(screen, selector),
    );
    expect(
      document.getAnimations().filter((animation) => {
        const effect = animation as CSSTransition;
        const target = (animation.effect as KeyframeEffect | null)?.target as Element;
        const kind = (animation.effect as KeyframeEffect | null)?.pseudoElement;
        return (
          animation instanceof CSSTransition &&
          effect.transitionProperty !== "color" &&
          ((own.includes(target) && kind === null) || (pseudo.includes(target) && kind !== null))
        );
      }),
    ).toHaveLength(0);
  });
});

describe("state animations", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it("lights the contact link and thickens its underline on hover", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const link = pick(screen, ".resume-contacts-value .resume-link");
    const idle = getComputedStyle(link).color;
    const line = getComputedStyle(link).textDecorationColor;

    await userEvent.hover(link);
    expect(transitioning(link, "color")).toBe(true);
    expect(transitioning(link, "text-decoration-color")).toBe(true);
    expect(transitioning(link, "text-decoration-thickness")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(link).color).not.toBe(idle);
    expect(getComputedStyle(link).textDecorationColor).not.toBe(line);
    near(Number.parseFloat(getComputedStyle(link).textDecorationThickness), 2, 0.5);
  });

  it("does not light a project link that has no address", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const link = pickAll(screen, ".resume-project .resume-link")[2]!;
    link.scrollIntoView({ block: "center" });
    const idle = getComputedStyle(link).color;

    await userEvent.hover(link);
    finishAnimations();
    expect(getComputedStyle(link).color).toBe(idle);
  });

  it("fills the download button on hover", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const button = pick(screen, ".resume-action");
    const idle = getComputedStyle(button, "::before").backgroundColor;

    await userEvent.hover(button);
    expect(transitioning(button, "background-color", "::before")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(button, "::before").backgroundColor).not.toBe(idle);
  });

  it("shows the focus ring on the button and the links", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });

    for (const selector of [
      ".resume-action",
      ".resume-contacts-value .resume-link",
      ".resume-footer-top",
    ]) {
      const element = pick<HTMLElement>(screen, selector);
      element.scrollIntoView({ block: "center" });
      expect(getComputedStyle(element).outlineColor).toBe("rgba(0, 0, 0, 0)");
      element.focus({ focusVisible: true } as FocusOptions);
      expect(transitioning(element, "outline-color")).toBe(true);
      finishAnimations();
      expect(getComputedStyle(element).outlineColor).not.toBe("rgba(0, 0, 0, 0)");
      element.blur();
      finishAnimations();
    }
  });

  it("lifts the arrow of the back to top link on hover", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const top = pick(screen, ".resume-footer-top");
    const icon = pick(screen, ".resume-footer-icon");
    top.scrollIntoView({ block: "center" });

    await userEvent.hover(top);
    expect(transitioning(icon, "translate")).toBe(true);
    finishAnimations();
    expect(Number.parseFloat(getComputedStyle(icon).translate.split(" ")[1]!)).toBeLessThan(0);
  });

  it("opens the mobile list over the page without moving the content", async () => {
    const screen = await renderResume({ width: 390, height: 780 });
    const before = rect(screen, ".resume-header").top;

    pick<HTMLButtonElement>(screen, ".page-sections-nav-head").click();
    await nextTick();
    finishAnimations();

    expect(rect(screen, ".resume-header").top).toBe(before);
    expect(style(screen, ".page-sections-nav-panel").visibility).toBe("visible");
    expect(
      pickAll(screen, ".page-sections-nav-panel .page-sections-nav-link").map((link) => text(link)),
    ).toEqual(navNames);
  });

  it("follows the sections while scrolling", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const current = () =>
      text(
        pickAll(screen, ".page-sections-nav-link").find(
          (link) => link.getAttribute("aria-current") === "location",
        ),
      );

    jump("experience");
    await expect.poll(current).toBe("Work Experience");
    jump("pochtoy");
    await expect.poll(current).toBe("Pochtoy.com LLC — Senior Frontend Developer");
    jump("projects");
    await expect.poll(current).toBe("Selected Projects");
    window.scrollTo({ top: 0, behavior: "instant" });
    await expect.poll(current).toBe("Summary");
  });

  it("keeps the numbered caption under the header when jumping to a section", async () => {
    const screen = await renderResume({ width: 1440, height: 900 });
    const heading = document.getElementById("skills")!;
    const label = pick(screen, "section[aria-labelledby='skills'] .page-section-label");

    jump("skills");
    near(label.getBoundingClientRect().top, 102);
    expect(heading.getBoundingClientRect().top).toBeGreaterThan(102);
  });
});
