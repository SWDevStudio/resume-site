import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SOCIAL, type Locale } from "~/assets/const";
import { useAlert } from "~/composables/useAlert";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import Contact from "./Contact.vue";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("~/assets/api", () => ({ $api: { contact: { send: mocks.send } } }));

interface ContactCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
  tall?: number;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: ContactCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: ContactCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const customTransitions = [
  ".home-contact-night",
  ".home-contact-day",
  ".home-contact-koi",
  ".home-contact-accent",
  ".home-contact-form",
  ".home-contact-pane",
  ".home-contact-social",
  ".home-contact-channel",
  ".home-contact-channel-value",
  ".home-contact-consent > label",
  ".home-contact-submit-arrow",
  ".home-contact-submit-spinner",
];

function finishAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().endTime === Infinity) animation.cancel();
    else animation.finish();
  }
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

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-contact-night, .home-contact-day").length;
}

function formReady(container: HTMLElement) {
  return [".home-contact-pane", ".input", ".textarea", ".checkbox", ".home-contact-submit"].every(
    (selector) => container.querySelector(selector),
  );
}

async function prefetchThemeLayers(screen: { container: HTMLElement }) {
  useThemeLayersPrefetch().prefetch();
  await expect.poll(() => layerCount(screen)).toBe(2);
  await expect
    .poll(() => [...screen.container.querySelectorAll("img")].every((image) => image.complete), {
      timeout: 5000,
    })
    .toBe(true);
  screen.container.getBoundingClientRect();
}

function pin(container: Element) {
  const wrapper = container.firstElementChild as HTMLElement;
  wrapper.style.height = "";
  wrapper.style.height = `${Math.ceil(wrapper.getBoundingClientRect().height)}px`;
}

async function renderCase(
  item: Pick<ContactCase, "width" | "height" | "locale" | "tall">,
  still = false,
) {
  await page.viewport(item.width, item.tall ?? item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const i18n = createApp(locale);
  const screen = await render(
    () =>
      h(
        "div",
        { class: ["bg-base-100 font-body text-base-content", { "pointer-events-none": still }] },
        h(Contact),
      ),
    { global: { plugins: [i18n] } },
  );
  await expect.poll(() => layerCount(screen)).toBe(1);
  await expect.poll(() => formReady(screen.container), { timeout: 5000 }).toBe(true);
  if (item.tall !== undefined) {
    screen.container.querySelector<HTMLElement>(".home-contact")!.style.minHeight = "0";
  }
  await document.fonts.ready;
  pin(screen.container);
  return Object.assign(screen, { i18n });
}

type Screen = Awaited<ReturnType<typeof renderCase>>;

function pick<T extends Element>(screen: Screen, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(screen: Screen, selector: string) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function box(screen: Screen, selector: string) {
  const slide = pick(screen, ".home-contact").getBoundingClientRect();
  const rect = pick(screen, selector).getBoundingClientRect();
  return {
    left: rect.left - slide.left,
    top: rect.top - slide.top,
    right: slide.right - rect.right,
    bottom: slide.bottom - rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function near(value: number, expected: number, tolerance = 1) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);
}

function size(screen: Screen, selector: string) {
  return Number.parseFloat(getComputedStyle(pick(screen, selector)).fontSize);
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

function errors(screen: Screen) {
  return pickAll(screen, ".input-field > p, .textarea-field > p, .checkbox-field > p").map((item) =>
    text(item),
  );
}

const fieldSelectors: Record<string, string> = {
  name: ".input-field:nth-of-type(1) .input",
  contact: ".input-field:nth-of-type(2) .input",
  message: ".textarea",
  consent: ".checkbox",
};

function field(screen: Screen, name: string) {
  return pick<HTMLInputElement | HTMLTextAreaElement>(screen, fieldSelectors[name]!);
}

function fill(screen: Screen, name: string, value: string) {
  const element = field(screen, name);
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function submit(screen: Screen) {
  pick<HTMLButtonElement>(screen, ".home-contact-submit").click();
}

function fillValid(screen: Screen) {
  fill(screen, "name", "John Doe");
  fill(screen, "contact", "john@example.com");
  fill(screen, "message", "Hello there");
  field(screen, "consent").click();
}

function alerts(selector = ".alert") {
  return [...document.querySelectorAll<HTMLElement>(selector)];
}

function resolve(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

const dictionaries = { en, ru };

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Let's grow together Drop me a message");
  await document.fonts.load('700 1em "Montserrat Alternates"', "Давайте расти вместе Напишите мне");
  await document.fonts.load('300 1em "Martian Mono"', "05 — CONTACT EMAIL TELEGRAM FIND ME ONLINE");
  await document.fonts.load('400 1em "Martian Mono"', "Name* Email Address* Message Send message");
  await document.fonts.load('300 1em "Martian Mono"', "Имя Сообщение Отправить Последние проекты");
  await document.fonts.load('400 1em "Share Tech Mono"', "Have a project in mind [you@mail.com]");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

beforeEach(() => {
  mocks.send.mockReset();
  mocks.send.mockResolvedValue(undefined);
});

afterEach(async () => {
  useAlert().clear();
  finishAnimations();
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item, true);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderCase(item, true);
    await prefetchThemeLayers(screen);
    setTheme("cyber-sakura");

    const animations = document.getAnimations();
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) / 2;
    }

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`switch-${item.name}`, { screenshotOptions: { animations: "allow" } });
  });
});

describe("behavior", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  it.each(["en", "ru"] as const)("renders the heading, contacts and form in %s", async (locale) => {
    const screen = await renderCase({ width: 1440, height: 900, locale });
    const slide = pick<HTMLElement>(screen, ".home-contact");
    const dictionary = dictionaries[locale].home.contact;

    expect(slide.tagName).toBe("SECTION");
    expect(slide.id).toBe("contact");
    expect(slide.querySelectorAll("h2")).toHaveLength(1);
    expect(slide.querySelector("h1")).toBeNull();
    expect(pick(screen, ".home-contact-label").textContent).toBe(dictionary.label);
    expect(text(pick(screen, ".home-contact-title"))).toBe(
      `${dictionary.titleTop} ${dictionary.titleAccent}`,
    );
    expect(pick(screen, ".home-contact-accent").textContent).toBe(dictionary.titleAccent);
    expect(pick(screen, ".home-contact-subtitle").textContent).toBe(dictionary.info.title);
    expect(pick(screen, ".home-contact-text").textContent).toBe(dictionary.info.text);
    expect(pickAll(screen, ".home-contact-channel-label").map((item) => text(item))).toEqual([
      dictionary.channels.email,
      dictionary.channels.telegram,
      dictionary.info.online,
    ]);
    expect(pickAll(screen, ".home-contact-channel-value").map((item) => text(item))).toEqual([
      SOCIAL.email.value,
      SOCIAL.telegram.value,
    ]);
    expect(pickAll(screen, ".input-field > label, .textarea-field > label").map(text)).toEqual([
      dictionary.form.name,
      dictionary.form.email,
      dictionary.form.message,
    ]);
    expect(
      pickAll<HTMLInputElement>(screen, ".input, .textarea").map((item) => item.placeholder),
    ).toEqual([
      dictionary.form.namePlaceholder.replace("{'@'}", "@"),
      dictionary.form.emailPlaceholder.replace("{'@'}", "@"),
      dictionary.form.messagePlaceholder,
    ]);
    expect(text(pick(screen, ".home-contact-consent label"))).toBe(dictionary.form.consent);
    expect(text(pick(screen, ".home-contact-submit"))).toBe(dictionary.form.submit);
    expect(text(pick(screen, ".home-contact-projects"))).toBe(dictionary.projects);
    expect(pick(screen, ".home-contact-decor").getAttribute("aria-hidden")).toBe("true");
  });

  it("links the contacts and the social networks", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const channels = pickAll<HTMLAnchorElement>(screen, ".home-contact-channel");
    const socials = pickAll<HTMLAnchorElement>(screen, ".home-contact-social");

    expect(channels.map((item) => item.getAttribute("href"))).toEqual([
      SOCIAL.email.href,
      SOCIAL.telegram.href,
    ]);
    expect(channels[0]!.getAttribute("target")).toBeNull();
    expect(channels[1]!.getAttribute("target")).toBe("_blank");
    expect(channels[1]!.getAttribute("rel")).toBe("noopener noreferrer");
    expect(socials.map((item) => item.getAttribute("aria-label"))).toEqual([
      "Telegram",
      "LinkedIn",
      "GitHub",
      "YouTube",
    ]);
    for (const item of socials) {
      expect(item.getAttribute("href")).toMatch(/^https:\/\//);
      expect(item.getAttribute("target")).toBe("_blank");
      expect(item.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("scrolls to the projects from the bar", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const projects = document.createElement("section");
    projects.id = "projects";
    projects.style.cssText = "height:1200px;margin-top:2000px";
    document.body.append(projects);
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, behavior: "instant" });

    pick<HTMLButtonElement>(screen, ".home-contact-projects").click();
    await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(0));
    const top = projects.getBoundingClientRect().top;
    projects.remove();
    document.documentElement.style.scrollBehavior = "";
    window.scrollTo({ top: 0, behavior: "instant" });

    near(top, 0, 2);
  });

  describe("layout", () => {
    it("lays out like the mockup on desktop", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const socials = pickAll(screen, ".home-contact-social").map((item) =>
        item.getBoundingClientRect(),
      );

      expect(box(screen, ".home-contact").height).toBeGreaterThanOrEqual(900);
      near(box(screen, ".home-contact-projects").bottom, 56);
      near(box(screen, ".home-contact-head").left, 140);
      near(size(screen, ".home-contact-label"), 14);
      near(size(screen, ".home-contact-title"), 64);
      near(size(screen, ".home-contact-subtitle"), 32);
      near(size(screen, ".home-contact-text"), 18);
      near(size(screen, ".home-contact-channel-label"), 12);
      near(size(screen, ".home-contact-channel-value"), 18);
      near(box(screen, ".home-contact-info").left, 140);
      near(box(screen, ".home-contact-info").width, 480);
      near(box(screen, ".home-contact-form").width, 600);
      near(box(screen, ".home-contact-form").right, 140);
      near(box(screen, ".home-contact-form").top, box(screen, ".home-contact-info").top);
      near(box(screen, ".home-contact-form").left - box(screen, ".home-contact-info").left, 560, 1);
      near(box(screen, ".home-contact-icon").width, 50);
      near(box(screen, ".home-contact-icon").height, 46);
      near(box(screen, ".home-contact-pane").width, 598);
      near(box(screen, ".home-contact-pane").left - box(screen, ".home-contact-form").left, 1);
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingTop).toBe("28px");
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingLeft).toBe("30px");
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingBottom).toBe("30px");
      near(box(screen, ".input").height, 52);
      near(box(screen, ".textarea").height, 120);
      near(box(screen, ".home-contact-submit").width, 230);
      near(box(screen, ".home-contact-submit").height, 56);
      near(box(screen, ".home-contact-submit").right, 140 + 30 + 1);
      near(box(screen, ".home-contact-projects").width, 1160);
      near(box(screen, ".home-contact-projects").height, 62);
      expect(socials.map((item) => item.width)).toEqual([48, 48, 48, 48]);
      near(socials[1]!.left - socials[0]!.right, 12);
      near(socials[2]!.left - socials[1]!.right, 12);
      near(socials[3]!.left - socials[2]!.right, 12);
    });

    it("lays out like the mockup on tablet", async () => {
      const screen = await renderCase({ width: 768, height: 900, tall: 1800 });

      near(box(screen, ".home-contact-head").left, 32);
      near(size(screen, ".home-contact-title"), 56);
      near(box(screen, ".home-contact-info").width, 704);
      near(box(screen, ".home-contact-form").width, 704);
      expect(box(screen, ".home-contact-form").top).toBeGreaterThan(
        box(screen, ".home-contact-info").top + box(screen, ".home-contact-info").height,
      );
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingTop).toBe("28px");
      near(box(screen, ".home-contact-submit").width, 230);
      near(box(screen, ".home-contact-projects").width, 704);
      near(box(screen, ".home-contact").height, 1388, 2);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(768);
    });

    it("lays out like the mockup on mobile", async () => {
      const screen = await renderCase({ width: 390, height: 780, tall: 2400 });

      near(box(screen, ".home-contact-head").left, 20);
      near(size(screen, ".home-contact-title"), 40);
      near(box(screen, ".home-contact-title").width, 230);
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingTop).toBe("22px");
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingLeft).toBe("18px");
      expect(getComputedStyle(pick(screen, ".home-contact-pane")).paddingBottom).toBe("24px");
      near(box(screen, ".home-contact-form").width, 350);
      near(box(screen, ".home-contact-projects").width, 350);
      near(box(screen, ".home-contact-submit").right, 20 + 18 + 1);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    });

    it.each(["en", "ru"] as const)(
      "starts below the header and ends with the projects button at 1440 x 900 in %s",
      async (locale) => {
        const screen = await renderCase({ width: 1440, height: 900, locale });
        const body = pick<HTMLElement>(screen, ".home-slide-body");
        const main = pick(screen, ".home-contact-main");

        expect(box(screen, ".home-contact").height).toBeGreaterThanOrEqual(900);
        expect(box(screen, ".home-contact-head").top).toBeGreaterThanOrEqual(110 - 1);
        expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
          110 - 1,
        );
        near(box(screen, ".home-contact-projects").bottom, 56);
        expect(main.scrollHeight).toBeLessThanOrEqual(main.clientHeight);
      },
    );

    it.each([
      { width: 1440, height: 900, header: 110 },
      { width: 768, height: 900, header: 94 },
      { width: 390, height: 780, header: 92 },
    ])("starts the content below the header at $width", async (item) => {
      const screen = await renderCase({ ...item, tall: item.width < 1024 ? 2400 : undefined });

      expect(box(screen, ".home-contact-head").top).toBeGreaterThanOrEqual(item.header - 1);
    });

    it.each([
      { width: 1440, height: 900, locale: "en" as const },
      { width: 1440, height: 900, locale: "ru" as const },
      { width: 1024, height: 800, locale: "en" as const },
      { width: 1024, height: 800, locale: "ru" as const },
      { width: 768, height: 900, locale: "ru" as const },
      { width: 390, height: 780, locale: "en" as const },
      { width: 390, height: 780, locale: "ru" as const },
      { width: 360, height: 740, locale: "ru" as const },
    ])("keeps everything inside the slide at $width in $locale", async (item) => {
      const screen = await renderCase({ ...item, tall: item.width < 1024 ? 2600 : undefined });
      const slide = pick(screen, ".home-contact").getBoundingClientRect();
      const parts = [
        ".home-contact-label",
        ".home-contact-title",
        ".home-contact-subtitle",
        ".home-contact-text",
        ".home-contact-channel",
        ".home-contact-social",
        ".home-contact-form",
        ".home-contact-projects",
        ".input-field",
        ".textarea-field",
        ".checkbox-field",
        ".home-contact-submit",
      ];

      for (const selector of parts) {
        for (const element of screen.container.querySelectorAll(selector)) {
          const rect = element.getBoundingClientRect();
          expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left);
          expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
        }
      }
      const form = pick(screen, ".home-contact-pane").getBoundingClientRect();
      for (const element of pickAll(screen, ".input-field, .textarea-field, .checkbox-field")) {
        const rect = element.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(form.left);
        expect(rect.right).toBeLessThanOrEqual(form.right + 0.5);
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
    });
  });

  describe("form", () => {
    it.each(["en", "ru"] as const)("shows every error on an empty submit in %s", async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const dictionary = dictionaries[locale].home.contact.form.errors;

      expect(errors(screen)).toEqual([]);
      submit(screen);
      await vi.waitFor(() => expect(errors(screen)).toHaveLength(3));

      expect(errors(screen)).toEqual([dictionary.name, dictionary.email, dictionary.consent]);
      expect(field(screen, "name").getAttribute("aria-invalid")).toBe("true");
      expect(field(screen, "contact").getAttribute("aria-invalid")).toBe("true");
      expect(field(screen, "message").getAttribute("aria-invalid")).toBeNull();
      expect(field(screen, "consent").getAttribute("aria-invalid")).toBe("true");
      expect(mocks.send).not.toHaveBeenCalled();
      expect(alerts()).toHaveLength(0);
    });

    it.each([
      { width: 1440, height: 900, locale: "en" as const },
      { width: 390, height: 780, locale: "ru" as const, tall: 2400 },
    ])("shows the errors under their fields at $width in $locale", async (item) => {
      const screen = await renderCase(item);

      submit(screen);
      await vi.waitFor(() => expect(errors(screen)).toHaveLength(3));
      finishAnimations();
      const pane = pick(screen, ".home-contact-pane").getBoundingClientRect();
      const shown = pickAll(screen, ".input-field > p, .textarea-field > p, .checkbox-field > p");

      expect(shown).toHaveLength(3);
      for (const error of shown) {
        const rect = error.getBoundingClientRect();
        const control = error.parentElement!.querySelector(".input, .textarea, .checkbox")!;

        expect(rect.height).toBeGreaterThan(0);
        expect(getComputedStyle(error).visibility).toBe("visible");
        expect(Number(getComputedStyle(error).opacity)).toBe(1);
        expect(rect.top).toBeGreaterThanOrEqual(control.getBoundingClientRect().top);
        expect(rect.left).toBeGreaterThanOrEqual(pane.left);
        expect(rect.right).toBeLessThanOrEqual(pane.right + 0.5);
        expect(rect.bottom).toBeLessThanOrEqual(pane.bottom + 0.5);
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
    });

    it("rejects a contact shorter than 3 characters", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      fill(screen, "name", "John");
      fill(screen, "contact", "ab");
      field(screen, "consent").click();
      submit(screen);
      await vi.waitFor(() => expect(errors(screen)).toHaveLength(1));

      expect(errors(screen)).toEqual([en.home.contact.form.errors.contactShort]);
      expect(mocks.send).not.toHaveBeenCalled();
    });

    it("needs the consent even when everything else is valid", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      fill(screen, "name", "John");
      fill(screen, "contact", "john@example.com");
      submit(screen);
      await vi.waitFor(() => expect(errors(screen)).toHaveLength(1));

      expect(errors(screen)).toEqual([en.home.contact.form.errors.consent]);
      expect(mocks.send).not.toHaveBeenCalled();
    });

    it("translates the shown errors when the language changes", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      submit(screen);
      await vi.waitFor(() => expect(errors(screen)).toHaveLength(3));
      expect(errors(screen)).toEqual([
        en.home.contact.form.errors.name,
        en.home.contact.form.errors.email,
        en.home.contact.form.errors.consent,
      ]);

      screen.i18n.global.locale.value = "ru";
      await vi.waitFor(() =>
        expect(errors(screen)).toEqual([
          ru.home.contact.form.errors.name,
          ru.home.contact.form.errors.email,
          ru.home.contact.form.errors.consent,
        ]),
      );

      screen.i18n.global.locale.value = "en";
      await vi.waitFor(() => expect(errors(screen)[0]).toBe(en.home.contact.form.errors.name));
    });

    it("sends the trimmed values, shows the alert and clears the form", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });

      fill(screen, "name", "  John Doe  ");
      fill(screen, "contact", " john@example.com ");
      fill(screen, "message", "Hello there");
      field(screen, "consent").click();
      submit(screen);

      await vi.waitFor(() => expect(alerts(".alert-success")).toHaveLength(1));
      expect(mocks.send).toHaveBeenCalledTimes(1);
      expect(mocks.send).toHaveBeenCalledWith({
        name: "John Doe",
        contact: "john@example.com",
        message: "Hello there",
        consent: true,
      });
      const alert = alerts(".alert-success")[0]!;
      expect(text(alert.querySelector(".alert-title"))).toBe(en.home.contact.form.success.title);
      expect(text(alert.querySelector(".alert-text"))).toBe(
        en.home.contact.form.success.description,
      );
      await vi.waitFor(() => {
        expect(field(screen, "name").value).toBe("");
        expect(field(screen, "contact").value).toBe("");
        expect(field(screen, "message").value).toBe("");
        expect((field(screen, "consent") as HTMLInputElement).checked).toBe(false);
      });
      expect(errors(screen)).toEqual([]);
    });

    it("shows the success alert in the current language", async () => {
      const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });

      fillValid(screen);
      submit(screen);

      await vi.waitFor(() => expect(alerts(".alert-success")).toHaveLength(1));
      const alert = alerts(".alert-success")[0]!;
      expect(text(alert.querySelector(".alert-title"))).toBe(ru.home.contact.form.success.title);
      expect(text(alert.querySelector(".alert-text"))).toBe(
        ru.home.contact.form.success.description,
      );
    });

    it("keeps the button busy while the message is being sent", async () => {
      let finish: () => void = () => {};
      mocks.send.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
      const screen = await renderCase({ width: 1440, height: 900 });
      const button = pick<HTMLButtonElement>(screen, ".home-contact-submit");

      expect(button.disabled).toBe(false);
      expect(button.getAttribute("aria-busy")).toBe("false");
      fillValid(screen);
      submit(screen);

      await vi.waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"));
      expect(button.disabled).toBe(true);
      expect(transitioning(button, "opacity")).toBe(true);
      expect(transitioning(pick(screen, ".home-contact-submit-spinner"), "opacity")).toBe(true);
      expect(getComputedStyle(pick(screen, ".home-contact-submit-spinner")).animationName).toBe(
        "spin",
      );
      expect(alerts()).toHaveLength(0);
      finishAnimations();
      expect(getComputedStyle(pick(screen, ".home-contact-submit-arrow")).opacity).toBe("0");
      expect(getComputedStyle(pick(screen, ".home-contact-submit-spinner")).opacity).toBe("1");

      finish();
      await vi.waitFor(() => expect(button.getAttribute("aria-busy")).toBe("false"));
      expect(button.disabled).toBe(false);
      finishAnimations();
      expect(getComputedStyle(pick(screen, ".home-contact-submit-arrow")).opacity).toBe("1");
      expect(getComputedStyle(pick(screen, ".home-contact-submit-spinner")).opacity).toBe("0");
    });

    it("sends a message only once while the button is busy", async () => {
      mocks.send.mockImplementation(() => new Promise(() => {}));
      const screen = await renderCase({ width: 1440, height: 900 });

      fillValid(screen);
      submit(screen);
      await vi.waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(1));
      pick<HTMLFormElement>(screen, ".home-contact-form").requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mocks.send).toHaveBeenCalledTimes(1);
    });

    it("shows an error alert and keeps the typed values when the sending fails", async () => {
      mocks.send.mockRejectedValue(new Error("offline"));
      const screen = await renderCase({ width: 1440, height: 900 });

      fillValid(screen);
      submit(screen);

      await vi.waitFor(() => expect(alerts(".alert-error")).toHaveLength(1));
      const alert = alerts(".alert-error")[0]!;
      expect(text(alert.querySelector(".alert-title"))).toBe(en.home.contact.form.failure.title);
      expect(text(alert.querySelector(".alert-text"))).toBe(
        en.home.contact.form.failure.description,
      );
      expect(alerts(".alert-success")).toHaveLength(0);
      expect(field(screen, "name").value).toBe("John Doe");
      expect(field(screen, "contact").value).toBe("john@example.com");
      expect((field(screen, "consent") as HTMLInputElement).checked).toBe(true);
      expect(pick<HTMLButtonElement>(screen, ".home-contact-submit").disabled).toBe(false);
    });
  });

  it("mounts only the layer of the current theme until the theme switch is intended", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(pickAll(screen, ".home-contact-night")).toHaveLength(1);
    expect(screen.container.querySelector(".home-contact-day")).toBeNull();
    expect(screen.container.querySelector(".home-contact-koi-day")).toBeNull();
    expect(pickAll(screen, ".home-contact-koi")).toHaveLength(1);
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = pick<HTMLElement>(screen, ".home-contact-night");
    const day = pick<HTMLElement>(screen, ".home-contact-day");
    const accent = pick<HTMLElement>(screen, ".home-contact-accent");
    const form = pick<HTMLElement>(screen, ".home-contact-form");
    const koi = pick<HTMLElement>(screen, ".home-contact-koi-night");
    const icon = pick<HTMLElement>(screen, ".home-contact-icon");
    const social = pick<HTMLElement>(screen, ".home-contact-social");
    const projects = pick<HTMLElement>(screen, ".home-contact-projects");

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(koi, "opacity")).toBe(true);
    expect(transitioning(accent, "--home-contact-accent-via")).toBe(true);
    expect(transitioning(form, "background-color")).toBe(true);
    expect(transitioning(form, "clip-path")).toBe(true);
    expect(transitioning(form, "border-top-left-radius")).toBe(true);
    expect(transitioning(pick(screen, ".home-contact-pane"), "background-color")).toBe(true);
    expect(transitioning(social, "border-top-left-radius")).toBe(true);
    expect(transitioning(social, "clip-path")).toBe(true);
    expect(transitioning(social, "opacity", "::before")).toBe(true);
    expect(transitioning(projects, "filter")).toBe(true);
    expect(transitioning(icon, "filter")).toBe(true);
    expect(transitioning(icon, "border-top-left-radius", "::before")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");

    await expect.poll(() => layerCount(screen)).toBe(1);
    expect(night.isConnected).toBe(false);
    expect(koi.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
    expect(pickAll(screen, ".home-contact-koi-day")).toHaveLength(1);
  });

  it("changes the shape of the form and the social buttons with the theme", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const form = pick<HTMLElement>(screen, ".home-contact-form");
    const social = pick<HTMLElement>(screen, ".home-contact-social");

    const darkForm = getComputedStyle(form).clipPath;
    const darkRadius = getComputedStyle(form).borderTopLeftRadius;
    const darkSocial = getComputedStyle(social).borderTopLeftRadius;
    setTheme("cyber-sakura");
    finishAnimations();

    expect(darkForm).toContain("polygon(");
    expect(getComputedStyle(form).clipPath).toContain("polygon(");
    expect(getComputedStyle(form).clipPath).not.toBe(darkForm);
    near(Number.parseFloat(darkRadius), 0);
    near(Number.parseFloat(getComputedStyle(form).borderTopLeftRadius), 24);
    near(Number.parseFloat(darkSocial), 0);
    expect(getComputedStyle(social).borderTopLeftRadius).toBe("50%");
  });

  it("colours the frame, the fill and the buttons from the theme tokens", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const form = pick<HTMLElement>(screen, ".home-contact-form");

    expect(getComputedStyle(form).backgroundColor).toBe(resolve("--color-primary"));
    expect(getComputedStyle(pick(screen, ".home-contact-label")).color).toBe(
      resolve("--color-primary-ink"),
    );
    expect(pick(screen, ".home-contact-submit").classList.contains("btn-primary")).toBe(false);
    expect(pick(screen, ".home-contact-projects").classList.contains("btn-gradient")).toBe(true);
    expect(pick(screen, ".home-contact-projects").classList.contains("btn-block")).toBe(true);
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = pick<HTMLElement>(screen, ".home-contact-night");
      const form = pick<HTMLElement>(screen, ".home-contact-form");

      setTheme("cyber-sakura");
      await nextTick();
      expect(transitioning(night, "opacity")).toBe(false);
      expect(transitioning(form, "clip-path")).toBe(false);
      for (const selector of customTransitions) {
        for (const element of screen.container.querySelectorAll(selector)) {
          expect(
            document
              .getAnimations()
              .some((animation) => (animation.effect as KeyframeEffect).target === element),
            selector,
          ).toBe(false);
        }
      }
      expect(getComputedStyle(night).opacity).toBe("0");
      expect(getComputedStyle(night).visibility).toBe("hidden");
    });

    it("keeps the busy button still", async () => {
      mocks.send.mockImplementation(() => new Promise(() => {}));
      const screen = await renderCase({ width: 1440, height: 900 });
      const spinner = pick(screen, ".home-contact-submit-spinner");

      fillValid(screen);
      submit(screen);
      await vi.waitFor(() =>
        expect(pick(screen, ".home-contact-submit").getAttribute("aria-busy")).toBe("true"),
      );

      expect(getComputedStyle(spinner).animationName).toBe("none");
      expect(transitioning(spinner, "opacity")).toBe(false);
      expect(getComputedStyle(spinner).opacity).toBe("1");
      expect(getComputedStyle(pick(screen, ".home-contact-submit-arrow")).opacity).toBe("0");
    });
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Contact) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="contact"');
    expect(html).toContain("home-contact-title");
    expect(html).toContain("Drop me a message");
    expect(html).toContain("home-contact-form");
    expect(html).toContain('placeholder="John Doe"');
  });
});
