import { h, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, type Locale } from "~/assets/const";
import enResume from "~/assets/data/en/resume.json";
import ruResume from "~/assets/data/ru/resume.json";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import ResumeActions from "./ResumeActions.vue";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

const state = vi.hoisted(() => ({ locale: "en" }));

vi.mock("~/composables/useLocale", () => ({
  useLocale: () => ({
    locale: {
      get value() {
        return state.locale;
      },
    },
    locales: ["ru", "en"],
    setLocale: vi.fn(),
  }),
}));

const messages = { en, ru };

interface Case {
  locale: Locale;
  long: string[];
  short: string[];
  aria: string[];
}

const cases: Case[] = [
  {
    locale: "en",
    long: ["DOWNLOAD PDF", "FOR LLM · MD"],
    short: ["PDF", "LLM · MD"],
    aria: ["Download the resume as a PDF file", "Open the resume as Markdown for LLMs"],
  },
  {
    locale: "ru",
    long: ["СКАЧАТЬ PDF", "ДЛЯ LLM · MD"],
    short: ["PDF", "LLM · MD"],
    aria: ["Скачать резюме в формате PDF", "Открыть резюме в формате Markdown для LLM"],
  },
];

async function renderActions(locale: Locale, width = 1440) {
  state.locale = locale;
  await page.viewport(width, 900);
  const screen = await render(() => h(ResumeActions), {
    global: { plugins: [createI18n({ legacy: false, locale, messages })] },
  });
  await nextTick();
  return screen;
}

function links(container: Element) {
  return [...container.querySelectorAll<HTMLAnchorElement>(".resume-action")];
}

beforeAll(async () => {
  await document.fonts.load('400 1em "Martian Mono"', "DOWNLOAD PDF СКАЧАТЬ LLM");
});

beforeEach(async () => {
  await page.viewport(1440, 900);
});

describe("the resume data", () => {
  it.each([
    ["en", enResume],
    ["ru", ruResume],
  ])("keeps no buttons or other interface text in the %s file", (_, data) => {
    expect(data.profile).not.toHaveProperty("actions");
    const json = JSON.stringify(data);
    expect(json).not.toContain("/resume.pdf");
    expect(json).not.toContain("/resume.md");
    expect(json).not.toContain("shortLabel");
  });
});

describe("ResumeActions", () => {
  it.each(cases)("takes the labels of $locale from the locale files", async (item) => {
    const screen = await renderActions(item.locale);
    const buttons = links(screen.container);

    expect(
      buttons.map((button) => button.querySelector(".resume-action-long")?.textContent),
    ).toEqual(item.long);
    expect(
      buttons.map((button) => button.querySelector(".resume-action-short")?.textContent?.trim()),
    ).toEqual(item.short);
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(item.aria);
    expect(item.long[0]).toBe(messages[item.locale].resume.actions.pdf);
    expect(item.long[1]).toBe(messages[item.locale].resume.actions.md);
  });

  it.each(cases)("links to the files of $locale built by the Route constants", async (item) => {
    const screen = await renderActions(item.locale);
    const buttons = links(screen.container);

    expect(buttons.map((button) => button.getAttribute("href"))).toEqual([
      Route.resumePdf(item.locale),
      Route.resumeMarkdown(item.locale),
    ]);
    expect(buttons.map((button) => button.getAttribute("href"))).toEqual([
      `/resume/${item.locale}.pdf`,
      `/resume/${item.locale}.md`,
    ]);
  });

  it("downloads the PDF and opens the Markdown in a new tab", async () => {
    const screen = await renderActions("ru");
    const [pdf, md] = links(screen.container);

    expect(pdf!.hasAttribute("download")).toBe(true);
    expect(md!.hasAttribute("download")).toBe(false);
    for (const button of [pdf!, md!]) {
      expect(button.target).toBe("_blank");
      expect(button.rel).toBe("noopener noreferrer");
    }
    expect(pdf!.classList.contains("resume-action-pdf")).toBe(true);
    expect(pdf!.classList.contains("resume-action-md")).toBe(false);
  });

  it("shows the long labels on the desktop and the short ones on the phone", async () => {
    const desktop = await renderActions("en", 1440);
    expect(links(desktop.container).map((button) => button.innerText.trim())).toEqual([
      "DOWNLOAD PDF",
      "FOR LLM · MD",
    ]);
    desktop.unmount();

    const phone = await renderActions("ru", 390);
    expect(links(phone.container).map((button) => button.innerText.trim())).toEqual([
      "PDF",
      "LLM · MD",
    ]);
  });
});
