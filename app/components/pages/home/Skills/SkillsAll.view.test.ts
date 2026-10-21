import { h, ref } from "vue";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildSkillGroups } from "#shared/mock/build";
import { staticSources } from "#shared/mock/sources.static";
import type { Locale } from "~/assets/const";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import type { SkillGroupView } from "#shared/types/catalog";
import SkillsAll from "./SkillsAll.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

interface AllCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: AllCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 780 },
  { name: "desktop-ru", width: 1440, height: 900, locale: "ru" },
  { name: "mobile-ru", width: 390, height: 780, locale: "ru" },
];

const switchCases: AllCase[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 780 },
];

const groupsOf: Record<Locale, SkillGroupView[]> = {
  en: buildSkillGroups(staticSources("en"), "en"),
  ru: buildSkillGroups(staticSources("ru"), "ru"),
};

const dialog = () => document.querySelector<HTMLDialogElement>("dialog.home-skills-all")!;

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

async function waitForState(state: string) {
  await expect
    .poll(() => document.querySelector<HTMLDialogElement>("dialog")?.dataset.state, {
      timeout: 15000,
    })
    .toBe(state);
}

async function mountAll(item: AllCase) {
  await page.viewport(item.width, item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const open = ref(false);
  const screen = await render(
    () =>
      h("div", { class: "min-h-screen bg-base-100 font-body text-base-content" }, [
        h("main", { class: "flex flex-col gap-6 p-10" }, [
          h("h1", { class: "font-head text-7xl" }, "Fullstack Developer"),
          h("p", { class: "max-w-xl" }, "Background page that stays behind the window."),
          h("div", { class: "h-40 rounded-box bg-secondary/40" }),
          h("div", { class: "h-40 rounded-box bg-accent/40" }),
        ]),
        h(SkillsAll, {
          groups: groupsOf[locale],
          modelValue: open.value,
          "onUpdate:modelValue": (value: boolean) => {
            open.value = value;
          },
        }),
      ]),
    { global: { plugins: [createI18n({ legacy: false, locale, messages: { ru, en } })] } },
  );
  await page.elementLocator(document.body).hover({ position: { x: 4, y: 4 } });
  screen.container.getBoundingClientRect();
  return { screen, open };
}

type Mounted = Awaited<ReturnType<typeof mountAll>>;

async function warmUp(mounted: Mounted) {
  await setReducedMotion("reduce");
  mounted.open.value = true;
  await waitForState("open");
  mounted.open.value = false;
  await waitForState("closed");
  await setReducedMotion("no-preference");
}

async function openAll(mounted: Mounted) {
  mounted.open.value = true;
  await expect.poll(() => document.querySelector("dialog")?.open, { timeout: 15000 }).toBe(true);
  finishAnimations();
  await waitForState("open");
}

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "All skills Frontend Backend");
  await document.fonts.load('300 1em "Martian Mono"', "02 — SKILLS 01 FRONTEND 18");
  await document.fonts.load('400 1em "Share Tech Mono"', "SYS://SKILLS.MODULE HOLO-LINK");
  await document.fonts.load('400 1em "Montserrat Alternates"', "Все навыки Лидерство");
  await document.fonts.load('300 1em "Montserrat Alternates"', "Лидерство и soft skills");
});

beforeEach(() => {
  setTheme("torii-synth");
});

afterEach(async () => {
  finishAnimations();
  await setReducedMotion("no-preference");
  document.documentElement.lang = "en";
  await page.viewport(1440, 900);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const mounted = await mountAll(item);
    await warmUp(mounted);
    await openAll(mounted);

    await expect.element(page.elementLocator(dialog())).toMatchScreenshot(`${theme}-${item.name}`);
  });

  it("hover", async () => {
    const mounted = await mountAll({ name: "hover", width: 1440, height: 900 });
    await warmUp(mounted);
    await openAll(mounted);
    const chip = dialog().querySelectorAll<HTMLElement>(".home-skills-all-chip")[2]!;

    await userEvent.hover(page.elementLocator(chip));
    finishAnimations();

    await expect
      .element(page.elementLocator(dialog().querySelector(".home-skills-all-group")!))
      .toMatchScreenshot(`hover-${theme}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const mounted = await mountAll(item);
    await warmUp(mounted);
    await openAll(mounted);
    dialog().getBoundingClientRect();
    setTheme("cyber-sakura");
    await expect.poll(() => dialog().querySelector(".modal-bloom-front")).not.toBeNull();

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(dialog()))
      .toMatchScreenshot(`switch-${item.name}`, { screenshotOptions: { animations: "allow" } });
  });
});
