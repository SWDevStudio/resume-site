import { createSSRApp, h, Suspense } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { $api } from "~/assets/api";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import DefaultLayout from "~/layouts/default.vue";
import Index from "./index.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

const mocks = vi.hoisted(() => ({ setLocale: vi.fn(), toggle: vi.fn() }));

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: mocks.setLocale }),
}));

vi.mock("~/composables/useTheme", () => import("../../test/mocks/useTheme"));

const SLIDES = ["top", "about", "skills", "why", "projects", "contact"];

function createApp() {
  return createI18n({ legacy: false, locale: "en", messages: { ru, en } });
}

async function renderPage(width = 1440, height = 900) {
  await page.viewport(width, height);
  document.documentElement.dataset.theme = "torii-synth";
  const screen = await render(
    () =>
      h(
        "div",
        {},
        h(DefaultLayout, null, { default: () => h(Suspense, null, { default: () => h(Index) }) }),
      ),
    { global: { plugins: [createApp()] } },
  );
  await expect.poll(() => document.getElementById("skills"), { timeout: 5000 }).not.toBeNull();
  await document.fonts.ready;
  return screen;
}

function poll<T>(read: () => T) {
  return expect.poll(read, { timeout: 5000 });
}

const root = () => document.documentElement;

const section = (id: string) => document.getElementById(id)!;

beforeAll(async () => {
  await document.fonts.load('300 1em "Martian Mono"', "About Portfolio Blog Contact");
});

afterEach(async () => {
  window.scrollTo({ top: 0, behavior: "instant" });
  await page.viewport(1440, 900);
});

describe("slides", () => {
  it("renders the sections in order", async () => {
    const screen = await renderPage();
    const ids = [...screen.container.querySelectorAll("main > .home > section")].map(
      (item) => item.id,
    );

    expect(ids).toEqual(SLIDES);
    expect(screen.container.querySelectorAll("main > .home")).toHaveLength(1);
    expect(screen.container.querySelectorAll("main + footer#footer")).toHaveLength(1);
  });

  it("asks the api for the projects once and keys the slide with the key of the request", async () => {
    const fetchList = vi.spyOn($api.projects, "fetchList");
    await renderPage();

    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(section("projects").getAttribute("data-atom-async")).toBe("home-projects");
    expect(section("projects").querySelectorAll(".home-projects-card")).toHaveLength(3);
    fetchList.mockRestore();
  });

  it("shows only favorite projects on the home page", async () => {
    const projects = await $api.projects.fetchList();
    const fetchList = vi
      .spyOn($api.projects, "fetchList")
      .mockResolvedValue(
        projects.map((project, index) => ({ ...project, isFavorite: index === 1 })),
      );
    try {
      await renderPage();
      const cards = section("projects").querySelectorAll(".home-projects-card");
      expect(cards).toHaveLength(1);
      expect(cards[0]!.textContent).toContain(projects[1]!.name);
    } finally {
      fetchList.mockRestore();
    }
  });

  it.each([
    { width: 1440, height: 900, blur: "2px" },
    { width: 800, height: 900, blur: "12px" },
    { width: 390, height: 780, blur: "12px" },
  ])("fixes the header with a $blur blur at $width", async ({ width, height, blur }) => {
    await renderPage(width, height);
    const header = document.querySelector<HTMLElement>(".the-header")!;

    expect(getComputedStyle(header).position).toBe("fixed");
    expect(getComputedStyle(header).backdropFilter).toBe(`blur(${blur})`);
  });

  it.each([
    { width: 1440, height: 900 },
    { width: 800, height: 900 },
  ])("keeps the header over the slides at $width", async ({ width, height }) => {
    await renderPage(width, height);
    const header = document.querySelector<HTMLElement>(".the-header")!;

    section("why").scrollIntoView({ behavior: "instant" });
    await poll(() => Math.round(header.getBoundingClientRect().top)).toBe(0);
  });

  it("shows the headings of the Why, Projects and Contact sections", async () => {
    await renderPage();
    const heading = (id: string) =>
      section(id).querySelector("h2")!.textContent?.replace(/\s+/g, " ").trim();

    expect(heading("why")).toBe(`${en.home.why.titleTop} ${en.home.why.titleAccent}`);
    expect(heading("projects")).toBe(
      `${en.home.projects.titleTop} ${en.home.projects.titleAccent}`,
    );
    expect(heading("contact")).toBe(`${en.home.contact.titleTop} ${en.home.contact.titleAccent}`);
  });

  it("builds the contact form and the footer instead of placeholders", async () => {
    await renderPage();
    const footer = section("footer");

    expect(section("contact").querySelectorAll("form input, form textarea")).toHaveLength(4);
    expect(section("contact").querySelector("button[type='submit']")!.textContent).toContain(
      en.home.contact.form.submit,
    );
    expect(footer.querySelector("h2")).toBeNull();
    expect(footer.querySelector("nav")).toBeNull();
    expect(footer.textContent).toContain(en.footer.tagline);
    expect(footer.textContent).toContain(
      en.footer.copyright.replace("{year}", String(new Date().getFullYear())),
    );
  });

  it("makes every slide at least as tall as the screen and snaps it to the start", async () => {
    await renderPage();

    for (const id of SLIDES) {
      const style = getComputedStyle(section(id));
      expect(section(id).getBoundingClientRect().height).toBeGreaterThanOrEqual(900);
      expect(style.scrollSnapAlign).toBe("start");
      expect(style.scrollSnapStop).toBe("always");
    }
  });

  it("lets the footer take its own height and snaps it to the end", async () => {
    await renderPage();
    const footer = section("footer");

    expect(footer.getBoundingClientRect().height).toBeLessThan(900);
    expect(getComputedStyle(footer).scrollSnapAlign).toBe("end");
    expect(getComputedStyle(footer).scrollSnapStop).toBe("always");
  });

  it("keeps the content of a slide inside the container", async () => {
    await renderPage();
    const body = (id: string) => section(id).querySelector<HTMLElement>(".home-slide-body")!;

    expect(body("about").classList.contains("container")).toBe(true);
    expect(body("about").classList.contains("container-wide")).toBe(false);
    expect(body("skills").classList.contains("container-wide")).toBe(true);
    expect(section("top").querySelector(".home-slide-body")).toBeNull();
    near(body("about").getBoundingClientRect().width, 1240);
    near(body("skills").getBoundingClientRect().width, 1280);
  });

  it("renders the hero first and stretches it to the screen", async () => {
    await renderPage(1440, 1000);

    expect(section("top").getBoundingClientRect().height).toBe(1000);
    expect(section("about").getBoundingClientRect().top).toBe(1000);
  });
});

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

describe("scroll snap", () => {
  it.each([
    { width: 1440, height: 900, snap: true },
    { width: 1024, height: 800, snap: true },
    { width: 2560, height: 1440, snap: true },
    { width: 1023, height: 900, snap: false },
    { width: 768, height: 900, snap: false },
    { width: 390, height: 780, snap: false },
    { width: 1440, height: 780, snap: false },
    { width: 1280, height: 700, snap: false },
  ])("at $width x $height is $snap", async ({ width, height, snap }) => {
    await renderPage(width, height);

    expect(getComputedStyle(root()).scrollSnapType).toBe(snap ? "y mandatory" : "none");
  });

  it.each([
    { width: 1440, height: 900 },
    { width: 800, height: 900 },
    { width: 390, height: 780 },
  ])("snaps the section start to the top of the screen at $width", async ({ width, height }) => {
    await renderPage(width, height);

    expect(Number.parseFloat(getComputedStyle(root()).scrollPaddingTop)).toBe(0);
  });

  it.each([
    { width: 1440, height: 900 },
    { width: 800, height: 900 },
    { width: 390, height: 780 },
  ])("keeps the slide content below the fixed header at $width", async ({ width, height }) => {
    await renderPage(width, height);
    const header = document.querySelector<HTMLElement>(".the-header")!.getBoundingClientRect();

    for (const id of ["about", "skills", "why", "projects", "contact"]) {
      const body = section(id).querySelector<HTMLElement>(".home-slide-body")!;
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
        header.height - 1,
      );
    }
  });

  it("scrolls smoothly unless the motion is reduced", async () => {
    await renderPage();

    expect(getComputedStyle(root()).scrollBehavior).toBe("smooth");
  });

  it("snaps a short scroll back to the hero", async () => {
    await renderPage();

    window.scrollTo({ top: 300, behavior: "instant" });
    await poll(() => Math.round(window.scrollY)).toBe(0);
  });

  it("snaps a longer scroll to a slide that covers the screen below the header", async () => {
    await renderPage();
    const top = section("about").offsetTop;

    window.scrollTo({ top: 1100, behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 300));

    near(window.scrollY, top, 1);
  });
});

describe("server", () => {
  it("renders the page without the browser", async () => {
    const app = createSSRApp({
      render: () => h(DefaultLayout, null, { default: () => h(Index) }),
    });
    app.use(createApp());
    const html = await renderToString(app);

    for (const id of [...SLIDES, "footer"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('class="the-header"');
    expect(html).toContain("<footer");
  });
});
