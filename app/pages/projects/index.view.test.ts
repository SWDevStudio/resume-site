import { h, Suspense } from "vue";
import { createI18n } from "vue-i18n";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { describe, expect, it, vi } from "vitest";
import { projects as catalog } from "~/assets/data/projects";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import DefaultLayout from "~/layouts/default.vue";
import Projects from "./index.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({ locale: { value: "en" }, locales: ["ru", "en"], setLocale: vi.fn() }),
}));

vi.mock("~/composables/useTheme", () => import("../../../test/mocks/useTheme"));

function createApp() {
  return createI18n({ legacy: false, locale: "en", messages: { ru, en } });
}

const withSuspense = () => h(Suspense, null, { default: () => h(Projects) });

async function renderPage() {
  await page.viewport(1440, 900);
  const screen = await render(
    () => h("div", {}, h(DefaultLayout, null, { default: withSuspense })),
    { global: { plugins: [createApp()] } },
  );
  await expect
    .poll(() => screen.container.querySelectorAll(".projects-card").length, { timeout: 5000 })
    .toBeGreaterThan(0);
  return screen;
}

describe("projects page", () => {
  it("lists every project of the catalog in its order, not only the favorites", async () => {
    const screen = await renderPage();
    const cards = screen.container.querySelectorAll(".projects-card");

    expect(cards).toHaveLength(catalog.length);
    expect(catalog.some((project) => !project.isFavorite)).toBe(true);
    expect(
      [...cards].map((card) =>
        card.querySelector(".projects-card-name")!.textContent!.trim().replace(/:$/, ""),
      ),
    ).toEqual(catalog.map((project) => project.name));
  });

  it("renders inside the default layout with the header and footer from it", async () => {
    const screen = await renderPage();

    expect(screen.container.querySelectorAll("header").length).toBeGreaterThan(0);
    expect(screen.container.querySelectorAll("footer")).toHaveLength(1);
    expect(screen.container.querySelectorAll(".projects")).toHaveLength(1);
    expect(screen.container.querySelector("main .projects")).not.toBeNull();
    expect(screen.container.querySelectorAll(".projects-header")).toHaveLength(1);
  });

  it("keeps the footer below the screen with no page at all", async () => {
    await page.viewport(1440, 900);
    const screen = await render(
      () => h("div", {}, h(DefaultLayout, null, { default: () => null })),
      {
        global: { plugins: [createApp()] },
      },
    );
    const main = screen.container.querySelector("main")!;
    const footer = screen.container.querySelector("footer")!;

    expect(main.getBoundingClientRect().height).toBeGreaterThanOrEqual(900);
    expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(900);
  });

  it("puts the footer after the catalog", async () => {
    const screen = await renderPage();
    const main = screen.container.querySelector("main")!;
    const footer = screen.container.querySelector("footer")!;

    expect(main.getBoundingClientRect().height).toBeGreaterThanOrEqual(900);
    expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      main.getBoundingClientRect().bottom - 1,
    );
  });
});
