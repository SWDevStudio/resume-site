import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createI18n } from "vue-i18n";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "~/assets/const";
import { useThemeLayersPrefetch } from "~/composables/useThemeLayers";
import en from "~/locales/en.json";
import ru from "~/locales/ru.json";
import Why from "./Why.vue";
import { useWhyChat } from "./useWhyChat";
import { agentTiming, askAgent } from "./whyAgent";
import { setTheme } from "../../../../../test/mocks/useTheme";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

vi.mock("~/composables/useTheme", () => import("../../../../../test/mocks/useTheme"));

type AgentFn = (
  question: string,
  signal?: AbortSignal,
  context?: {
    locale: string;
    reply: string;
  },
) => AsyncGenerator<string, void, undefined>;

const agentOverride = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("./whyAgent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./whyAgent")>();
  return {
    ...actual,
    askAgent: (...args: Parameters<typeof actual.askAgent>) =>
      agentOverride.current
        ? (agentOverride.current as typeof actual.askAgent)(...args)
        : actual.askAgent(...args),
  };
});

interface WhyCase {
  name: string;
  width: number;
  height: number;
  locale?: Locale;
  tall?: number;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: WhyCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const switchCases: WhyCase[] = [{ name: "desktop", width: 1440, height: 900 }];

const customTransitions = [
  ".home-why-night",
  ".home-why-day",
  ".home-why-owl",
  ".home-why-accent",
  ".home-why-window",
  ".home-why-edge",
  ".home-why-pane",
  ".home-why-bar",
  ".home-why-dots",
  ".home-why-dot",
  ".home-why-status-dot",
  ".home-why-avatar",
  ".home-why-bubble",
  ".home-why-input",
  ".home-why-chip",
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

function layerCount(screen: { container: HTMLElement }) {
  return screen.container.querySelectorAll(".home-why-night, .home-why-day, .home-why-owl").length;
}

async function prefetchThemeLayers(screen: { container: HTMLElement }) {
  useThemeLayersPrefetch().prefetch();
  await expect.poll(() => layerCount(screen)).toBe(4);
  await expect
    .poll(() => [...screen.container.querySelectorAll("img")].every((image) => image.complete), {
      timeout: 5000,
    })
    .toBe(true);
  screen.container.getBoundingClientRect();
}

function createApp(locale: Locale) {
  return createI18n({ legacy: false, locale, messages: { ru, en } });
}

async function renderCase(item: Pick<WhyCase, "width" | "height" | "locale" | "tall">) {
  await page.viewport(item.width, item.tall ?? item.height);
  const locale = item.locale ?? "en";
  document.documentElement.lang = locale;
  const screen = await render(
    () => h("div", { class: "bg-base-100 font-body text-base-content" }, h(Why)),
    { global: { plugins: [createApp(locale)] } },
  );
  await expect.poll(() => layerCount(screen)).toBe(2);
  if (item.tall !== undefined)
    screen.container.querySelector<HTMLElement>(".home-why")!.style.minHeight = "0";
  screen.container.getBoundingClientRect();
  return screen;
}

function pick<T extends Element>(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
  return screen.container.querySelector<T>(selector)!;
}

function pickAll<T extends Element>(
  screen: Awaited<ReturnType<typeof renderCase>>,
  selector: string,
) {
  return [...screen.container.querySelectorAll<T>(selector)];
}

function box(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
  const slide = pick(screen, ".home-why").getBoundingClientRect();
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

function size(screen: Awaited<ReturnType<typeof renderCase>>, selector: string) {
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

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

interface Step {
  chunk?: string;
  done?: true;
  error?: Error;
}

interface Call {
  question: string;
  signal?: AbortSignal;
  context?: {
    locale: string;
    reply: string;
  };
}

function controlled() {
  const queue: Step[] = [];
  const calls: Call[] = [];
  let wake: (() => void) | null = null;

  const agent: AgentFn = async function* (question, signal, context) {
    calls.push({ question, signal, context });
    signal?.addEventListener("abort", () => wake?.());
    for (;;) {
      while (queue.length === 0) {
        signal?.throwIfAborted();
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
      signal?.throwIfAborted();
      const step = queue.shift()!;
      if (step.error) throw step.error;
      if (step.done) return;
      yield step.chunk!;
    }
  };

  function feed(step: Step) {
    queue.push(step);
    wake?.();
  }

  return {
    agent,
    calls,
    push: (chunk: string) => feed({ chunk }),
    end: () => feed({ done: true }),
    fail: () => feed({ error: new Error("boom") }),
  };
}

async function ask(screen: Awaited<ReturnType<typeof renderCase>>, question: string) {
  const input = pick<HTMLInputElement>(screen, ".home-why-textbox");
  await userEvent.click(page.elementLocator(input));
  await userEvent.fill(page.elementLocator(input), question);
  await userEvent.click(page.elementLocator(pick(screen, ".home-why-ask")));
}

function bubbles(screen: Awaited<ReturnType<typeof renderCase>>) {
  return pickAll(screen, ".home-why-bubble");
}

function lastBubble(screen: Awaited<ReturnType<typeof renderCase>>) {
  return bubbles(screen).at(-1)!;
}

function setFastAgent() {
  agentTiming.thinking = 20;
  agentTiming.chunkMin = 5;
  agentTiming.chunkMax = 10;
}

const defaultTiming = { ...agentTiming };

beforeAll(async () => {
  await page.viewport(1440, 900);
  await document.fonts.load('400 1em "Righteous"', "Does my experience fit you?");
  await document.fonts.load('700 1em "Montserrat Alternates"', "Подойдёт ли вам мой опыт?");
  await document.fonts.load('300 1em "Martian Mono"', "03 — WHY ME ONLINE michael.ai");
  await document.fonts.load('400 1em "Martian Mono"', "ASK michael.ai AI Спросить ИИ");
  await document.fonts.load('800 1em "Martian Mono"', "AI ИИ");
  await document.fonts.load('400 1em "Share Tech Mono"', "Hi! I'm Michael's AI assistant.");
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: true });
});

afterAll(async () => {
  await cdp().send("Emulation.setScrollbarsHidden", { hidden: false });
});

afterEach(async () => {
  agentOverride.current = null;
  Object.assign(agentTiming, defaultTiming);
  finishAnimations();
  await setReducedMotion("no-preference");
  await page.viewport(1440, 900);
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    setTheme(theme);
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderCase(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("theme switch", () => {
  it.each(switchCases)("$name", async (item) => {
    setTheme("torii-synth");
    const screen = await renderCase(item);
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

  it("renders the heading, the chat window and the advantage cards", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const slide = pick<HTMLElement>(screen, ".home-why");

    expect(slide.tagName).toBe("SECTION");
    expect(slide.id).toBe("why");
    expect(slide.querySelectorAll("h2")).toHaveLength(1);
    expect(slide.querySelector("h1")).toBeNull();
    expect(pick(screen, ".home-why-label").textContent).toBe(en.home.why.label);
    expect(text(pick(screen, ".home-why-title"))).toBe(
      `${en.home.why.titleTop} ${en.home.why.titleAccent}`,
    );
    expect(pick(screen, ".home-why-accent").textContent).toBe(en.home.why.titleAccent);
    expect(text(pick(screen, ".home-why-name"))).toBe(
      `${en.home.why.chat.name} ${en.home.why.chat.role}`,
    );
    expect(text(pick(screen, ".home-why-status"))).toBe(en.home.why.chat.status);
    expect(pick(screen, ".home-why-avatar").textContent).toBe(en.home.why.chat.avatar);
    expect(pick(screen, ".home-why-bubble").textContent).toBe(en.home.why.chat.greeting);
    expect(text(pick(screen, ".home-why-prompt"))).toBe(">");
    expect(pick<HTMLInputElement>(screen, ".home-why-textbox").placeholder).toBe(
      en.home.why.chat.placeholder,
    );
    expect(text(pick(screen, ".home-why-ask"))).toBe(en.home.why.chat.ask);
    expect(pick(screen, ".home-why-ask").classList.contains("btn")).toBe(true);
    expect(pickAll(screen, ".home-why-chip").map((item) => text(item))).toEqual(
      Object.values(en.home.why.chat.chips),
    );
    expect(pickAll(screen, ".home-why-card")).toHaveLength(0);
    expect(pickAll(screen, ".home-why-cards")).toHaveLength(0);
    expect(pick(screen, ".home-why-main").children).toHaveLength(3);
    expect([...pick(screen, ".home-why-main").children].map((item) => item.className)).toEqual([
      "home-why-head",
      "home-why-stage",
      "home-why-features",
    ]);
    const features = pickAll(screen, ".home-why-feature");
    expect(features.map((item) => item.classList.contains("feature"))).toEqual([true, true]);
    expect(features.map((item) => text(item.querySelector(".card-title")!))).toEqual([
      `01 ${en.home.why.features.autonomy.title}`,
      `02 ${en.home.why.features.performance.title}`,
    ]);
    expect(
      features.map((item) => item.querySelector(".feature-label")!.textContent?.trim()),
    ).toEqual([en.home.why.features.label, en.home.why.features.label]);
    expect(
      features.map((item) => item.querySelector(".feature-prompt")!.textContent?.trim()),
    ).toEqual([en.home.why.features.autonomy.prompt, en.home.why.features.performance.prompt]);
    expect([...pick(screen, ".home-why-stage").children].map((item) => item.className)).toEqual([
      "home-why-window",
      "home-why-owl home-why-owl-night",
    ]);
    expect(pick(screen, ".home-why-decor").getAttribute("aria-hidden")).toBe("true");
    await prefetchThemeLayers(screen);
    expect([...pick(screen, ".home-why-stage").children].map((item) => item.className)).toEqual([
      "home-why-window",
      "home-why-owl home-why-owl-night",
      "home-why-owl home-why-owl-day home-why-owl-late",
    ]);
    expect(pick(screen, ".home-why-decor").querySelector("img")).toBeNull();
    for (const owl of pickAll(screen, ".home-why-owl")) {
      expect(owl.getAttribute("aria-hidden")).toBe("true");
      expect(owl.getAttribute("alt")).toBe("");
    }
  });

  it("translates the texts", async () => {
    const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });

    expect(pick(screen, ".home-why-label").textContent).toBe(ru.home.why.label);
    expect(text(pick(screen, ".home-why-title"))).toBe(
      `${ru.home.why.titleTop} ${ru.home.why.titleAccent}`,
    );
    expect(text(pick(screen, ".home-why-name"))).toBe(
      `${ru.home.why.chat.name} ${ru.home.why.chat.role}`,
    );
    expect(text(pick(screen, ".home-why-status"))).toBe(ru.home.why.chat.status);
    expect(pick(screen, ".home-why-bubble").textContent).toBe(ru.home.why.chat.greeting);
    expect(pick<HTMLInputElement>(screen, ".home-why-textbox").placeholder).toBe(
      ru.home.why.chat.placeholder,
    );
    expect(text(pick(screen, ".home-why-ask"))).toBe(ru.home.why.chat.ask);
    expect(pickAll(screen, ".home-why-chip").map((item) => text(item))).toEqual(
      Object.values(ru.home.why.chat.chips),
    );
  });

  it("has no card keys left in the locales", () => {
    expect("cards" in en.home.why).toBe(false);
    expect("cards" in ru.home.why).toBe(false);
    expect("cardLabel" in en.home.why).toBe(false);
    expect("cardLabel" in ru.home.why).toBe(false);
  });

  it("lays out like the mockup on desktop", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(box(screen, ".home-why").height).toBeGreaterThanOrEqual(900);
    near(
      box(screen, ".home-why-window").top - box(screen, ".home-why-head").top,
      box(screen, ".home-why-head").height + 16,
    );
    near(
      box(screen, ".home-why-features").top - box(screen, ".home-why-window").top,
      box(screen, ".home-why-window").height + 36,
    );
    near(box(screen, ".home-why-features").bottom, 48);
    near(box(screen, ".home-why-feature").width, (1160 - 28) / 2);
    near(box(screen, ".home-why-head").left, 140);
    near(box(screen, ".home-why-window").left, 140);
    near(box(screen, ".home-why-window").width, 1160);
    near(size(screen, ".home-why-label"), 14);
    near(size(screen, ".home-why-title"), 56);
    near(size(screen, ".home-why-name"), 14);
    near(size(screen, ".home-why-bubble"), 14);
    near(size(screen, ".home-why-textbox"), 16);
    near(size(screen, ".home-why-chip"), 14);
    near(box(screen, ".home-why-ask").width, 170);
    near(box(screen, ".home-why-ask").height, 48);
    near(box(screen, ".home-why-avatar").width, 36);
    near(box(screen, ".home-why-input").height, 96);
  });

  it("lays out like the mockup on tablet", async () => {
    const screen = await renderCase({ width: 768, height: 900 });

    near(box(screen, ".home-why-head").left, 32);
    near(box(screen, ".home-why-window").width, 704);
    near(size(screen, ".home-why-title"), 46);
    near(pick(screen, ".home-why-title").getBoundingClientRect().width, 480);
    expect(pick(screen, ".home-why-title").getBoundingClientRect().height).toBeGreaterThan(80);
  });

  it("lays out like the mockup on mobile", async () => {
    const screen = await renderCase({ width: 390, height: 780 });
    const input = pick(screen, ".home-why-input");
    const ask = pick(screen, ".home-why-ask").getBoundingClientRect();
    const frame = input.getBoundingClientRect();

    near(box(screen, ".home-why-head").left, 20);
    near(box(screen, ".home-why-window").width, 350);
    near(size(screen, ".home-why-title"), 34);
    near(pick(screen, ".home-why-title").getBoundingClientRect().width, 250);
    expect(getComputedStyle(input).flexDirection).toBe("column");
    near(frame.right - ask.right, 14 + 1);
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 1280, height: 800, locale: "en" as const },
    { width: 1024, height: 800, locale: "en" as const },
    { width: 768, height: 900, locale: "en" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 360, height: 740, locale: "ru" as const },
    { width: 2560, height: 1440, locale: "en" as const },
  ])("stretches the chat window over the whole container at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    const body = pick<HTMLElement>(screen, ".home-slide-body");
    const rect = body.getBoundingClientRect();
    const style = getComputedStyle(body);
    const left = rect.left + Number.parseFloat(style.paddingLeft);
    const right = rect.right - Number.parseFloat(style.paddingRight);
    const window = pick(screen, ".home-why-window").getBoundingClientRect();
    const head = pick(screen, ".home-why-head").getBoundingClientRect();

    expect(body.classList.contains("container")).toBe(true);
    near(window.left, left, 0.5);
    near(window.right, right, 0.5);
    near(window.width, right - left, 1);
    near(head.left, left, 0.5);
    for (const selector of [".home-why-window", ".home-why-edge", ".home-why-pane"]) {
      const part = getComputedStyle(pick(screen, selector));
      expect(part.maxWidth, selector).toBe("none");
      expect(part.marginLeft, selector).toBe("0px");
      expect(part.marginRight, selector).toBe("0px");
    }
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 1280, height: 800, locale: "en" as const },
    { width: 1024, height: 800, locale: "ru" as const },
    { width: 1023, height: 800, locale: "en" as const },
    { width: 768, height: 900, locale: "en" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 360, height: 740, locale: "ru" as const },
    { width: 2560, height: 1440, locale: "en" as const },
  ])("seats the owls on the top edge of the chat window at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    await prefetchThemeLayers(screen);
    const spacing = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 4;
    const slide = pick(screen, ".home-why").getBoundingClientRect();
    const offset = Number.parseFloat(getComputedStyle(pick(screen, ".home-slide-body")).paddingTop);
    const bar = pick(screen, ".home-why-bar").getBoundingClientRect();
    const window = pick(screen, ".home-why-window").getBoundingClientRect();
    const owls = pickAll(screen, ".home-why-owl");
    const blank = { "home-why-owl-night": 15 / 549, "home-why-owl-day": 13 / 514 };

    expect(owls).toHaveLength(2);
    for (const owl of owls) {
      const rect = owl.getBoundingClientRect();
      const kind = owl.classList[1] as keyof typeof blank;
      const drawn = rect.bottom - rect.height * blank[kind];
      const crossesHorizontally = bar.left < rect.right && bar.right > rect.left;

      expect(crossesHorizontally, kind).toBe(true);
      expect(rect.bottom - window.top, kind).toBeGreaterThanOrEqual(0);
      expect(rect.bottom - window.top, kind).toBeLessThanOrEqual(2 * spacing);
      near(drawn, window.top, 1);
      expect(drawn, kind).toBeLessThanOrEqual(bar.top);
      expect(rect.top - slide.top, kind).toBeGreaterThanOrEqual(offset - 0.5);
      expect(rect.right, kind).toBeLessThanOrEqual(slide.right);
    }
  });

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 768, height: 900, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 2560, height: 1440, locale: "en" as const },
  ])(
    "makes room for the biggest owl between the header and the window at $width in $locale",
    async (item) => {
      const screen = await renderCase(item);
      await prefetchThemeLayers(screen);
      const slide = pick(screen, ".home-why").getBoundingClientRect();
      const offset = Number.parseFloat(
        getComputedStyle(pick(screen, ".home-slide-body")).paddingTop,
      );
      const head = pick(screen, ".home-why-head");
      const window = pick(screen, ".home-why-window").getBoundingClientRect();
      const gap = Number.parseFloat(getComputedStyle(pick(screen, ".home-why-main")).rowGap);
      const owls = pickAll(screen, ".home-why-owl").map((owl) => owl.getBoundingClientRect());
      const room = Math.max(...owls.map((rect) => rect.height - (rect.bottom - window.top)));
      const highest = Math.min(...owls.map((rect) => rect.top));

      near(Number.parseFloat(getComputedStyle(head).minHeight), room - gap, 0.5);
      near(window.top - head.getBoundingClientRect().bottom, gap, 0.5);
      expect(highest - slide.top).toBeGreaterThanOrEqual(offset - 0.5);
      if (
        head.getBoundingClientRect().height - Number.parseFloat(getComputedStyle(head).minHeight) <
        0.5
      )
        near(highest - slide.top, offset, 0.5);
    },
  );

  it.each([
    { width: 1440, height: 900, locale: "en" as const },
    { width: 1440, height: 900, locale: "ru" as const },
    { width: 1024, height: 800, locale: "ru" as const },
    { width: 768, height: 900, locale: "ru" as const },
    { width: 390, height: 780, locale: "en" as const },
    { width: 390, height: 780, locale: "ru" as const },
    { width: 360, height: 740, locale: "ru" as const },
  ])("keeps everything inside the slide at $width in $locale", async (item) => {
    const screen = await renderCase(item);
    const slide = pick(screen, ".home-why").getBoundingClientRect();
    const parts = [
      ".home-why-label",
      ".home-why-title",
      ".home-why-window",
      ".home-why-bar",
      ".home-why-bubble",
      ".home-why-input",
      ".home-why-ask",
      ".home-why-chip",
      ".home-why-feature",
    ];

    for (const selector of parts) {
      for (const element of screen.container.querySelectorAll(selector)) {
        const rect = element.getBoundingClientRect();
        expect(rect.left, selector).toBeGreaterThanOrEqual(slide.left);
        expect(rect.right, selector).toBeLessThanOrEqual(slide.right + 0.5);
      }
    }
    for (const selector of [".home-why-ask", ".home-why-chip", ".home-why-avatar"]) {
      for (const element of screen.container.querySelectorAll(selector)) {
        expect(element.scrollWidth, selector).toBeLessThanOrEqual(element.clientWidth + 1);
      }
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(item.width);
  });

  it.each(["en", "ru"] as const)(
    "starts below the header and keeps the window and the cards on the slide at 1440 x 900 in %s",
    async (locale) => {
      const screen = await renderCase({ width: 1440, height: 900, locale });
      const slide = pick(screen, ".home-why").getBoundingClientRect();
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const main = pick(screen, ".home-why-main").getBoundingClientRect();
      const header = 110;

      expect(slide.height).toBeGreaterThanOrEqual(900);
      expect(main.top - slide.top).toBeGreaterThanOrEqual(header - 1);
      expect(Number.parseFloat(getComputedStyle(body).paddingTop)).toBeGreaterThanOrEqual(
        header - 1,
      );
      for (const selector of [".home-why-window", ".home-why-features"]) {
        expect(pick(screen, selector).getBoundingClientRect().bottom, selector).toBeLessThanOrEqual(
          slide.bottom - 24,
        );
      }
    },
  );

  it.each([
    { width: 1440, height: 900, locale: "en" as const, own: 195, free: 0 },
    { width: 1440, height: 900, locale: "ru" as const, own: 195, free: 0 },
    { width: 1024, height: 800, locale: "en" as const, own: 195, free: 0 },
    { width: 768, height: 900, locale: "en" as const, own: 160, free: 0 },
    { width: 1440, height: 1200, locale: "en" as const, own: 195, free: 203 },
  ])(
    "gives the free height of the slide to the dialog at $width x $height in $locale",
    async (item) => {
      const screen = await renderCase(item);
      const body = pick<HTMLElement>(screen, ".home-slide-body");
      const bottom =
        body.getBoundingClientRect().bottom -
        Number.parseFloat(getComputedStyle(body).paddingBottom);

      const dialog = pick(screen, ".home-why-dialog").getBoundingClientRect().height;

      near(pick(screen, ".home-why-features").getBoundingClientRect().bottom, bottom, 0.5);
      expect(dialog).toBeGreaterThanOrEqual(item.own - 1);
      if (item.free > 0) near(dialog, item.own + item.free, 4);
      else near(dialog, item.own, 1);
    },
  );

  it("keeps the dialog at its own height when the slide has no free space", async () => {
    const screen = await renderCase({ width: 390, height: 780, tall: 2200 });

    near(pick(screen, ".home-why-dialog").getBoundingClientRect().height, 160, 1);
  });

  it.each([
    { width: 1440, height: 900, header: 110 },
    { width: 768, height: 900, header: 94 },
    { width: 390, height: 780, header: 68 },
  ])("starts the content below the header at $width", async (item) => {
    const screen = await renderCase(item);
    const head = pick(screen, ".home-why-head").getBoundingClientRect();
    const slide = pick(screen, ".home-why").getBoundingClientRect();

    expect(head.top - slide.top).toBeGreaterThanOrEqual(item.header - 1);
  });

  it("mounts only the layer and the owl of the current theme until the switch is intended", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });

    expect(pickAll(screen, ".home-why-night")).toHaveLength(1);
    expect(pickAll(screen, ".home-why-owl-night")).toHaveLength(1);
    expect(screen.container.querySelector(".home-why-day")).toBeNull();
    expect(screen.container.querySelector(".home-why-owl-day")).toBeNull();
  });

  it("follows the theme with two crossfading layers", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    await prefetchThemeLayers(screen);
    const night = pick<HTMLElement>(screen, ".home-why-night");
    const day = pick<HTMLElement>(screen, ".home-why-day");
    const owlNight = pick<HTMLElement>(screen, ".home-why-owl-night");
    const owlDay = pick<HTMLElement>(screen, ".home-why-owl-day");
    const accent = pick<HTMLElement>(screen, ".home-why-accent");
    const window = pick<HTMLElement>(screen, ".home-why-window");
    const edge = pick<HTMLElement>(screen, ".home-why-edge");
    const pane = pick<HTMLElement>(screen, ".home-why-pane");
    const bar = pick<HTMLElement>(screen, ".home-why-bar");
    const dots = pick<HTMLElement>(screen, ".home-why-dots");
    const dot = pick<HTMLElement>(screen, ".home-why-dot");
    const statusDot = pick<HTMLElement>(screen, ".home-why-status-dot");
    const avatar = pick<HTMLElement>(screen, ".home-why-avatar");
    const bubble = pick<HTMLElement>(screen, ".home-why-bubble");
    const input = pick<HTMLElement>(screen, ".home-why-input");
    const chip = pick<HTMLElement>(screen, ".home-why-chip");

    expect(getComputedStyle(night).opacity).toBe("1");
    expect(getComputedStyle(night).visibility).toBe("visible");
    expect(getComputedStyle(day).opacity).toBe("0");
    expect(getComputedStyle(day).visibility).toBe("hidden");
    expect(getComputedStyle(owlNight).opacity).toBe("1");
    expect(getComputedStyle(owlDay).opacity).toBe("0");
    expect(getComputedStyle(dot).width).toBe("14px");

    setTheme("cyber-sakura");
    expect(transitioning(night, "opacity")).toBe(true);
    expect(transitioning(night, "visibility")).toBe(true);
    expect(transitioning(day, "opacity")).toBe(true);
    expect(transitioning(owlNight, "opacity")).toBe(true);
    expect(transitioning(owlDay, "opacity")).toBe(true);
    expect(transitioning(accent, "--home-why-accent-via")).toBe(true);
    expect(transitioning(window, "filter")).toBe(true);
    expect(transitioning(edge, "clip-path")).toBe(true);
    expect(transitioning(edge, "border-top-left-radius")).toBe(true);
    expect(transitioning(edge, "--home-why-edge-to")).toBe(true);
    expect(transitioning(edge, "--home-why-edge-stop")).toBe(true);
    expect(transitioning(pane, "background-color")).toBe(true);
    expect(transitioning(pane, "clip-path")).toBe(true);
    expect(transitioning(bar, "--home-why-bar-from")).toBe(true);
    expect(transitioning(dots, "column-gap")).toBe(true);
    expect(transitioning(dot, "width")).toBe(true);
    expect(transitioning(dot, "border-top-left-radius")).toBe(true);
    expect(transitioning(dot, "transform")).toBe(true);
    expect(transitioning(statusDot, "background-color")).toBe(true);
    expect(transitioning(avatar, "clip-path")).toBe(true);
    expect(transitioning(avatar, "--home-why-avatar-to")).toBe(true);
    expect(transitioning(bubble, "border-top-left-radius")).toBe(true);
    expect(transitioning(bubble, "clip-path")).toBe(true);
    expect(transitioning(input, "border-top-left-radius")).toBe(true);
    expect(transitioning(input, "clip-path")).toBe(true);
    expect(transitioning(chip, "border-top-left-radius")).toBe(true);
    expect(transitioning(chip, "clip-path")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }

    expect(getComputedStyle(night).opacity).toBe("0");
    expect(getComputedStyle(night).visibility).toBe("hidden");
    expect(getComputedStyle(day).opacity).toBe("1");
    expect(getComputedStyle(day).visibility).toBe("visible");
    expect(getComputedStyle(owlDay).opacity).toBe("1");
    expect(getComputedStyle(dot).width).toBe("11px");

    await expect.poll(() => layerCount(screen)).toBe(2);
    expect(night.isConnected).toBe(false);
    expect(owlNight.isConnected).toBe(false);
    expect(day.isConnected).toBe(true);
    expect(owlDay.isConnected).toBe(true);
  });

  it("changes the shape of the window with the theme", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const edge = pick<HTMLElement>(screen, ".home-why-edge");
    const pane = pick<HTMLElement>(screen, ".home-why-pane");

    const dark = [getComputedStyle(edge).clipPath, getComputedStyle(pane).borderTopLeftRadius];
    setTheme("cyber-sakura");
    finishAnimations();
    const light = [getComputedStyle(edge).clipPath, getComputedStyle(pane).borderTopLeftRadius];

    expect(dark[0]).toContain("polygon(");
    expect(light[0]).toContain("polygon(");
    expect(light[0]).not.toBe(dark[0]);
    expect(dark[1]).toBe("0px");
    expect(light[1]).toBe("26.5px");
  });

  it("highlights a chip on hover", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const chip = pick<HTMLElement>(screen, ".home-why-chip");
    const before = getComputedStyle(chip).borderTopColor;

    await userEvent.hover(page.elementLocator(chip));
    expect(transitioning(chip, "border-top-color")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(chip).borderTopColor).not.toBe(before);
    expect(getComputedStyle(chip).borderTopColor).toBe(resolve("--color-primary"));
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("switches the theme without transitions", async () => {
      const screen = await renderCase({ width: 1440, height: 900 });
      const night = pick<HTMLElement>(screen, ".home-why-night");
      const edge = pick<HTMLElement>(screen, ".home-why-edge");

      setTheme("cyber-sakura");
      await nextTick();
      expect(transitioning(night, "opacity")).toBe(false);
      expect(transitioning(edge, "clip-path")).toBe(false);
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
  });

  it("renders on the server", async () => {
    const app = createSSRApp({ render: () => h(Why) });
    app.use(createApp("en"));
    const html = await renderToString(app);

    expect(html).toContain('id="why"');
    expect(html).toContain("home-why-title");
    expect(html).toContain("michael.ai");
    expect(html.match(/home-why-chip"/g)).toHaveLength(4);
    expect(html).not.toContain("home-why-card");
    expect(html.match(/class="feature home-why-feature/g)).toHaveLength(2);
  });
});

async function settleScroll(screen: Awaited<ReturnType<typeof renderCase>>) {
  const dialog = pick<HTMLElement>(screen, ".home-why-dialog");
  await expect
    .poll(() => dialog.scrollHeight - dialog.clientHeight - dialog.scrollTop, { timeout: 4000 })
    .toBeLessThanOrEqual(1);
}

describe("chat states", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  afterEach(() => {
    agentOverride.current = null;
  });

  it.each([
    { name: "waiting", state: 0 },
    { name: "streaming", state: 1 },
    { name: "answered", state: 2 },
  ])("lays out the $name state inside the chat window", async (item) => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const reply = en.home.why.chat.mockReply;
    const screen = await renderCase({ width: 1440, height: 900 });

    await ask(screen, en.home.why.chat.chips.clients);
    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    if (item.state >= 1) {
      agent.push(reply.slice(0, 60));
      await expect.poll(() => text(lastBubble(screen))).toBe(reply.slice(0, 60).trim());
    }
    if (item.state >= 2) {
      agent.push(reply.slice(60));
      agent.end();
      await expect.poll(() => text(lastBubble(screen))).toBe(reply);
      await expect
        .poll(() => pick<HTMLInputElement>(screen, ".home-why-textbox").disabled)
        .toBe(false);
    }
    finishAnimations();
    await settleScroll(screen);
    finishAnimations();
    const dialog = pick(screen, ".home-why-dialog").getBoundingClientRect();
    const last = lastBubble(screen);
    const busy = item.state < 2;

    expect(bubbles(screen)).toHaveLength(3);
    expect(last.querySelector(".home-why-typing") !== null).toBe(item.state === 0);
    expect(last.classList.contains("home-why-bubble-streaming")).toBe(item.state === 1);
    expect(pick(screen, ".home-why-ask").getAttribute("aria-busy")).toBe(String(busy));
    const spinner = getComputedStyle(pick(screen, ".home-why-ask-spinner")).opacity;
    const arrow = getComputedStyle(pick(screen, ".home-why-ask-arrow")).opacity;
    expect([spinner, arrow]).toEqual(busy ? ["1", "0"] : ["0", "1"]);
    for (const bubble of bubbles(screen)) {
      const rect = bubble.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(dialog.left - 0.5);
      expect(rect.right).toBeLessThanOrEqual(dialog.right + 0.5);
    }
    near(last.getBoundingClientRect().bottom, dialog.bottom, 40);
    expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(dialog.bottom + 0.5);
    expect(pick(screen, ".home-why-message-user").getBoundingClientRect().right).toBeGreaterThan(
      last.getBoundingClientRect().right,
    );
  });
});

describe("chat", () => {
  beforeEach(() => {
    setTheme("torii-synth");
  });

  afterEach(() => {
    agentOverride.current = null;
    Object.assign(agentTiming, defaultTiming);
  });

  it("renders a real labelled text field", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const form = pick<HTMLFormElement>(screen, ".home-why-input");
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");
    const button = pick<HTMLButtonElement>(screen, ".home-why-ask");
    const dialog = pick(screen, ".home-why-dialog");

    expect(form.tagName).toBe("FORM");
    expect(input.type).toBe("text");
    expect(input.getAttribute("aria-label")).toBe(en.home.why.chat.inputLabel);
    expect(input.autocomplete).toBe("off");
    expect(input.maxLength).toBeGreaterThan(0);
    expect(button.type).toBe("submit");
    expect(button.disabled).toBe(true);
    expect(dialog.getAttribute("aria-live")).toBe("polite");
    expect(dialog.getAttribute("role")).toBe("log");
  });

  it("sends the question with the button", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });

    await ask(screen, "  How fast can you start?  ");

    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    const message = pick(screen, ".home-why-message-user");
    expect(text(message)).toBe("How fast can you start?");
    expect(message.parentElement).toBe(pick(screen, ".home-why-thread"));
    expect(pick<HTMLInputElement>(screen, ".home-why-textbox").value).toBe("");
    expect(agent.calls.map((call) => call.question)).toEqual(["How fast can you start?"]);
    expect(agent.calls[0]!.context?.reply).toBe(en.home.why.chat.mockReply);
    expect(getComputedStyle(message).flexDirection).toBe("row-reverse");
  });

  it("sends the question with Enter", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");

    await userEvent.click(page.elementLocator(input));
    await userEvent.fill(page.elementLocator(input), "Enter works");
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    expect(text(pick(screen, ".home-why-message-user"))).toBe("Enter works");
    expect(agent.calls).toHaveLength(1);
  });

  it("does not send an empty or blank line", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");
    const button = pick<HTMLButtonElement>(screen, ".home-why-ask");

    await userEvent.click(page.elementLocator(input));
    await userEvent.keyboard("{Enter}");
    await userEvent.fill(page.elementLocator(input), "    ");
    await userEvent.keyboard("{Enter}");

    expect(button.disabled).toBe(true);
    expect(agent.calls).toHaveLength(0);
    expect(bubbles(screen)).toHaveLength(1);

    await userEvent.fill(page.elementLocator(input), "now real");
    expect(button.disabled).toBe(false);
    expect(transitioning(button, "opacity")).toBe(true);
  });

  it("shows the typing indicator until the first chunk and streams the text", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });

    await ask(screen, "question");
    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    const bubble = lastBubble(screen);

    expect(bubble.querySelectorAll(".home-why-typing-dot")).toHaveLength(3);
    expect(text(bubble.querySelector(".sr-only"))).toBe(en.home.why.chat.typing);
    expect(getComputedStyle(bubble.querySelector(".home-why-typing-dot")!).animationName).toBe(
      "home-why-typing",
    );
    expect(bubble.classList.contains("home-why-bubble-streaming")).toBe(false);
    expect(pick(screen, ".home-why-dialog").getAttribute("aria-busy")).toBe("true");

    agent.push("Michael ");
    await expect.poll(() => bubble.querySelector(".home-why-typing")).toBeNull();
    expect(text(bubble)).toBe("Michael");
    expect(bubble.classList.contains("home-why-bubble-streaming")).toBe(true);
    const cursor = bubble.querySelector<HTMLElement>(".home-why-cursor")!;
    expect(getComputedStyle(cursor).animationName).toBe("home-why-blink");
    await expect.poll(() => cursor.getBoundingClientRect().width).toBeGreaterThan(8);

    agent.push("fits ");
    agent.push("you");
    await expect.poll(() => text(bubble)).toBe("Michael fits you");

    agent.end();
    await expect.poll(() => bubble.classList.contains("home-why-bubble-streaming")).toBe(false);
    await expect.poll(() => cursor.getBoundingClientRect().width).toBe(0);
    expect(pick(screen, ".home-why-dialog").getAttribute("aria-busy")).toBe("false");
  });

  it.each([
    { locale: "en" as const, reply: en.home.why.chat.mockReply },
    {
      locale: "ru" as const,
      reply:
        "Михаил подойдет вам по всем параметрам, т.к он делал такие проекты не раз, я оцениваю его на 10 из 10",
    },
  ])("answers in $locale piece by piece and ends with the full reply", async (item) => {
    setFastAgent();
    const screen = await renderCase({ width: 1440, height: 900, locale: item.locale });
    const dialog = pick(screen, ".home-why-dialog");
    const seen = new Set<string>();
    const observer = new MutationObserver(() => {
      const list = bubbles(screen);
      if (list.length === 3 && !list[2]!.querySelector(".home-why-typing"))
        seen.add(list[2]!.textContent ?? "");
    });
    observer.observe(dialog, { childList: true, subtree: true, characterData: true });

    await ask(screen, "anything");
    await expect.poll(() => text(lastBubble(screen)), { timeout: 4000 }).toBe(item.reply);
    observer.disconnect();

    const parts = [...seen].map((part) => part.trim()).filter(Boolean);
    expect(parts.length).toBeGreaterThan(2);
    for (const part of parts) expect(item.reply.startsWith(part)).toBe(true);
    expect(dialog.querySelectorAll(".home-why-typing")).toHaveLength(0);
  });

  it("keeps the exact Russian reply in the locale", () => {
    expect(ru.home.why.chat.mockReply).toBe(
      "Михаил подойдет вам по всем параметрам, т.к он делал такие проекты не раз, я оцениваю его на 10 из 10",
    );
  });

  it("splits the mock reply into one to three words after a thinking pause", async () => {
    agentTiming.thinking = 30;
    agentTiming.chunkMin = 1;
    agentTiming.chunkMax = 2;
    const reply = en.home.why.chat.mockReply;
    const started = performance.now();
    const chunks: string[] = [];
    let first = 0;

    for await (const chunk of askAgent("any", undefined, { locale: "en", reply })) {
      if (chunks.length === 0) first = performance.now() - started;
      chunks.push(chunk);
    }

    expect(first).toBeGreaterThanOrEqual(28);
    expect(chunks.join("")).toBe(reply);
    expect(chunks.length).toBeGreaterThan(4);
    for (const chunk of chunks) {
      const words = chunk.trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(1);
      expect(words).toBeLessThanOrEqual(3);
    }
  });

  it("stops the mock stream on abort", async () => {
    agentTiming.thinking = 200;
    const controller = new AbortController();
    const result = askAgent("any", controller.signal, { locale: "en", reply: "a b c" }).next();
    controller.abort();

    await expect(result).rejects.toBeDefined();
    await expect(askAgent("any", controller.signal).next()).rejects.toBeDefined();
  });

  it("marks the button busy with a spinner while the answer is coming and then restores it", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const button = pick<HTMLButtonElement>(screen, ".home-why-ask");
    const arrow = pick<HTMLElement>(screen, ".home-why-ask-arrow");
    const spinner = pick<HTMLElement>(screen, ".home-why-ask-spinner");
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");

    await ask(screen, "question");
    await expect.poll(() => button.getAttribute("aria-busy")).toBe("true");

    expect(button.disabled).toBe(true);
    expect(input.disabled).toBe(true);
    expect(
      pickAll<HTMLButtonElement>(screen, ".home-why-chip").every((chip) => chip.disabled),
    ).toBe(true);
    expect(getComputedStyle(spinner).animationName).toBe("spin");
    expect(transitioning(arrow, "opacity")).toBe(true);
    expect(transitioning(spinner, "opacity")).toBe(true);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }
    expect(getComputedStyle(arrow).opacity).toBe("0");
    expect(getComputedStyle(spinner).opacity).toBe("1");

    agent.push("done");
    agent.end();
    await expect.poll(() => button.getAttribute("aria-busy")).toBe("false");
    await expect.poll(() => document.activeElement).toBe(input);
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(true);
    expect(getComputedStyle(spinner).animationName).toBe("none");
    expect(transitioning(arrow, "opacity")).toBe(true);
    finishAnimations();
    expect(getComputedStyle(arrow).opacity).toBe("1");
    expect(getComputedStyle(spinner).opacity).toBe("0");
  });

  it("puts a chip text into the field and focuses it without sending", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");

    for (const chip of pickAll(screen, ".home-why-chip")) {
      await userEvent.click(page.elementLocator(chip));
      expect(input.value).toBe(text(chip));
      await expect.poll(() => document.activeElement).toBe(input);
      expect(input.selectionStart).toBe(input.value.length);
    }

    expect(agent.calls).toHaveLength(0);
    expect(bubbles(screen)).toHaveLength(1);
    expect(pick<HTMLButtonElement>(screen, ".home-why-ask").disabled).toBe(false);
  });

  it("shows an error in the bubble and lets the user send again", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const input = pick<HTMLInputElement>(screen, ".home-why-textbox");

    await ask(screen, "will fail");
    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    agent.fail();

    await expect.poll(() => text(lastBubble(screen))).toBe(en.home.why.chat.error);
    expect(lastBubble(screen).classList.contains("home-why-bubble-error")).toBe(true);
    expect(input.disabled).toBe(false);
    expect(input.value).toBe("will fail");
    expect(pick<HTMLButtonElement>(screen, ".home-why-ask").disabled).toBe(false);
    expect(pick(screen, ".home-why-ask").getAttribute("aria-busy")).toBe("false");

    await userEvent.click(page.elementLocator(pick(screen, ".home-why-ask")));
    await expect.poll(() => bubbles(screen)).toHaveLength(5);
    agent.push("second try");
    agent.end();

    await expect.poll(() => text(lastBubble(screen))).toBe("second try");
    expect(lastBubble(screen).classList.contains("home-why-bubble-error")).toBe(false);
    expect(text(bubbles(screen)[2])).toBe(en.home.why.chat.error);
  });

  it("translates the error", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900, locale: "ru" });

    await ask(screen, "вопрос");
    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    agent.fail();

    await expect.poll(() => text(lastBubble(screen))).toBe(ru.home.why.chat.error);
  });

  it("cancels the previous stream on a new send and on unmount", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    let chat!: ReturnType<typeof useWhyChat>;
    const Harness = defineComponent({
      setup() {
        chat = useWhyChat();
        return () => h("div");
      },
    });
    const screen = await render(Harness, { global: { plugins: [createApp("en")] } });

    void chat.send("first");
    await expect.poll(() => agent.calls.length).toBe(1);
    void chat.send("second");
    await expect.poll(() => agent.calls.length).toBe(2);

    expect(agent.calls[0]!.signal!.aborted).toBe(true);
    expect(agent.calls[1]!.signal!.aborted).toBe(false);
    expect(chat.messages.value.map((message) => `${message.role}:${message.text}`)).toEqual([
      "user:first",
      "user:second",
      "assistant:",
    ]);

    agent.push("answer");
    agent.end();
    await expect.poll(() => chat.status.value).toBe("idle");
    expect(chat.messages.value.at(-1)!.text).toBe("answer");

    void chat.send("third");
    await expect.poll(() => agent.calls.length).toBe(3);
    await screen.unmount();
    expect(agent.calls[2]!.signal!.aborted).toBe(true);
  });

  it("keeps the height and scrolls the messages inside the window", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    const dialog = pick<HTMLElement>(screen, ".home-why-dialog");
    const windowHeight = box(screen, ".home-why-window").height;
    const slideHeight = box(screen, ".home-why").height;
    const dialogHeight = dialog.getBoundingClientRect().height;

    for (let index = 0; index < 4; index += 1) {
      await ask(screen, `question number ${index}`);
      await expect.poll(() => bubbles(screen)).toHaveLength(3 + index * 2);
      agent.push(en.home.why.chat.mockReply);
      agent.end();
      await expect
        .poll(() => pick<HTMLInputElement>(screen, ".home-why-textbox").disabled)
        .toBe(false);
    }

    expect(box(screen, ".home-why-window").height).toBe(windowHeight);
    expect(box(screen, ".home-why").height).toBe(slideHeight);
    expect(dialog.getBoundingClientRect().height).toBe(dialogHeight);
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight + 100);
    expect(getComputedStyle(dialog).overflowY).toBe("auto");
    await settleScroll(screen);
    expect(dialog.scrollTop).toBeGreaterThan(100);
  });

  it("highlights the field when it has focus", async () => {
    const screen = await renderCase({ width: 1440, height: 900 });
    const form = pick<HTMLElement>(screen, ".home-why-input");
    const before = getComputedStyle(form).borderTopColor;

    await userEvent.click(page.elementLocator(pick(screen, ".home-why-textbox")));
    expect(transitioning(form, "border-top-color")).toBe(true);
    finishAnimations();

    expect(getComputedStyle(form).borderTopColor).not.toBe(before);
    expect(getComputedStyle(form).borderTopColor).toBe(resolve("--color-primary"));
  });

  it("follows the theme in the chat parts", async () => {
    const agent = controlled();
    agentOverride.current = agent.agent;
    const screen = await renderCase({ width: 1440, height: 900 });
    await ask(screen, "theme");
    await expect.poll(() => bubbles(screen)).toHaveLength(3);
    const user = pick<HTMLElement>(screen, ".home-why-bubble-user");
    const dot = pick<HTMLElement>(screen, ".home-why-typing-dot");
    const textbox = pick<HTMLElement>(screen, ".home-why-textbox");
    finishAnimations();

    setTheme("cyber-sakura");

    expect(transitioning(user, "border-top-left-radius")).toBe(true);
    expect(transitioning(user, "clip-path")).toBe(true);
    expect(transitioning(user, "background-color")).toBe(true);
    expect(transitioning(dot, "background-color")).toBe(true);
    expect(transitioning(textbox, "color")).toBe(true);
  });

  describe("reduced motion", () => {
    beforeEach(async () => {
      await setReducedMotion("reduce");
    });

    it("keeps the dots, spinner and cursor still and shows messages without animation", async () => {
      const agent = controlled();
      agentOverride.current = agent.agent;
      const screen = await renderCase({ width: 1440, height: 900 });

      await ask(screen, "question");
      await expect.poll(() => bubbles(screen)).toHaveLength(3);
      const bubble = lastBubble(screen);
      const row = bubble.parentElement!;

      expect(getComputedStyle(bubble.querySelector(".home-why-typing-dot")!).animationName).toBe(
        "none",
      );
      expect(getComputedStyle(pick(screen, ".home-why-ask-spinner")).animationName).toBe("none");
      expect(transitioning(row, "opacity")).toBe(false);
      expect(
        document
          .getAnimations()
          .some((animation) => (animation.effect as KeyframeEffect).target === row),
      ).toBe(false);

      agent.push("text");
      await expect.poll(() => bubble.classList.contains("home-why-bubble-streaming")).toBe(true);
      expect(getComputedStyle(bubble.querySelector(".home-why-cursor")!).animationName).toBe(
        "none",
      );
      expect(transitioning(pick(screen, ".home-why-ask-arrow"), "opacity")).toBe(false);
      agent.end();
    });
  });
});
