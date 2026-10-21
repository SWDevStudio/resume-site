import { h } from "vue";
import { createI18n } from "vue-i18n";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { describe, expect, it, vi } from "vitest";
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

describe("projects page", () => {
  it("mounts a single empty root container", async () => {
    const screen = await render(() => h(Projects), { global: { plugins: [createApp()] } });
    const root = screen.container.firstElementChild!;

    expect(screen.container.children).toHaveLength(1);
    expect(root.classList.contains("projects-page")).toBe(true);
    expect(root.children).toHaveLength(0);
    expect(root.textContent).toBe("");
  });

  it("renders inside the default layout with the header and footer from it", async () => {
    await page.viewport(1440, 900);
    const screen = await render(
      () => h("div", {}, h(DefaultLayout, null, { default: () => h(Projects) })),
      { global: { plugins: [createApp()] } },
    );

    expect(screen.container.querySelectorAll("header")).toHaveLength(1);
    expect(screen.container.querySelectorAll("footer")).toHaveLength(1);
    expect(screen.container.querySelectorAll(".projects-page")).toHaveLength(1);
    expect(screen.container.querySelector("main .projects-page")).not.toBeNull();
  });

  it.each([
    { name: "an empty page", content: () => h(Projects) },
    { name: "no page at all", content: () => null },
  ])("keeps the footer below the screen with $name", async ({ content }) => {
    await page.viewport(1440, 900);
    const screen = await render(() => h("div", {}, h(DefaultLayout, null, { default: content })), {
      global: { plugins: [createApp()] },
    });
    const main = screen.container.querySelector("main")!;
    const footer = screen.container.querySelector("footer")!;

    expect(main.getBoundingClientRect().height).toBeGreaterThanOrEqual(900);
    expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(900);
  });
});
