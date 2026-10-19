import { nextTick } from "vue";
import { cdp, page } from "vitest/browser";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useAlert } from "./useAlert";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

const themes = ["torii-synth", "cyber-sakura"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const finishAnimations = () => {
  for (const animation of document.getAnimations()) animation.finish();
};

async function setReducedMotion(value: "reduce" | "no-preference") {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value }],
  });
}

const alert = useAlert();

const host = () => document.querySelector<HTMLElement>("[data-alert-host]");

const hosts = () => document.querySelectorAll("[data-alert-host]");

const shown = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-alert-host] .alert:not(.alert-leave-active)"),
  );

const present = () => document.querySelectorAll("[data-alert-host] .alert").length;

const titles = () => shown().map((item) => item.querySelector(".alert-title")!.textContent);

const animationsInHost = () =>
  document.getAnimations().filter((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    return target instanceof Node && Boolean(host()?.contains(target));
  });

beforeAll(async () => {
  await document.fonts.load('300 1em "Martian Mono"', "Ответ в течение дня Обычно отвечаю");
  await document.fonts.load('400 1em "Martian Mono"', "Ответ в течение дня");
});

beforeEach(() => {
  document.documentElement.dataset.theme = "torii-synth";
});

afterEach(async () => {
  vi.useRealTimers();
  alert.clear();
  finishAnimations();
  host()?.remove();
  await page.viewport(1024, 768);
  await setReducedMotion("no-preference");
});

describe("host", () => {
  it("is not created until the first message", async () => {
    expect(host()).toBeNull();
  });

  it("is created lazily once and reused", async () => {
    alert.info({ title: "first", duration: 60000 });
    alert.error({ title: "second", duration: 60000 });
    await nextTick();

    expect(hosts()).toHaveLength(1);
    expect(host()!.parentElement).toBe(document.body);
    expect(titles()).toEqual(["first", "second"]);
  });

  it("reuses a host that is already in the page", async () => {
    const existing = document.createElement("div");
    existing.setAttribute("data-alert-host", "");
    document.body.appendChild(existing);
    alert.info({ title: "reused", duration: 60000 });
    await nextTick();

    expect(hosts()).toHaveLength(1);
    expect(host()).toBe(existing);
    expect(titles()).toEqual(["reused"]);
  });

  it("is a polite live region", async () => {
    alert.info({ title: "live", duration: 60000 });
    await nextTick();
    const region = host()!.querySelector(".toast")!;

    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-relevant")).toBe("additions text");
  });

  it("is a fixed toast area in the top corner", async () => {
    await page.viewport(1024, 768);
    alert.info({ title: "corner", duration: 60000 });
    await nextTick();
    const region = host()!.querySelector<HTMLElement>(".toast")!;
    const rect = region.getBoundingClientRect();

    expect(getComputedStyle(region).position).toBe("fixed");
    expect(rect.top).toBeLessThan(40);
    expect(window.innerWidth - rect.right).toBeLessThan(40);
  });

  it("is centered at the top on a narrow screen", async () => {
    await page.viewport(390, 800);
    alert.info({ title: "mobile", duration: 60000 });
    await nextTick();
    const rect = host()!.querySelector<HTMLElement>(".toast")!.getBoundingClientRect();

    expect(rect.top).toBeLessThan(40);
    expect(Math.abs(rect.left - (window.innerWidth - rect.right))).toBeLessThan(2);
  });
});

describe("messages", () => {
  it("shows a message right after the call", async () => {
    const id = alert.success({
      title: "Сообщение отправлено",
      description: "Спасибо!",
      duration: 60000,
    });
    await nextTick();

    const [item] = shown();
    expect(typeof id).toBe("number");
    expect(shown()).toHaveLength(1);
    expect(item!.classList.contains("alert-success")).toBe(true);
    expect(item!.querySelector(".alert-title")!.textContent).toBe("Сообщение отправлено");
    expect(item!.querySelector(".alert-text")!.textContent).toBe("Спасибо!");
  });

  it("omits the description block when there is none", async () => {
    alert.info({ title: "Only title", duration: 60000 });
    await nextTick();

    expect(host()!.querySelector(".alert-text")).toBeNull();
  });

  it("returns a new id for every message", async () => {
    const ids = [
      alert.info({ title: "a", duration: 60000 }),
      alert.info({ title: "b", duration: 60000 }),
      alert.info({ title: "c", duration: 60000 }),
    ];

    expect(new Set(ids).size).toBe(3);
  });

  it.each([
    ["info", "status", "alert-info"],
    ["success", "status", "alert-success"],
    ["warning", "alert", "alert-warning"],
    ["error", "alert", "alert-error"],
  ] as const)("%s message has role %s", async (status, role, modifier) => {
    alert[status]({ title: status, duration: 60000 });
    await nextTick();
    const [item] = shown();

    expect(item!.getAttribute("role")).toBe(role);
    expect(item!.classList.contains(modifier)).toBe(true);
  });

  it("labels the close button with Close unless told otherwise", async () => {
    alert.info({ title: "default", duration: 60000 });
    alert.info({ title: "custom", closeLabel: "Закрыть уведомление", duration: 60000 });
    await nextTick();

    expect(
      Array.from(host()!.querySelectorAll(".alert-close"), (button) =>
        button.getAttribute("aria-label"),
      ),
    ).toEqual(["Close", "Закрыть уведомление"]);
  });

  it("shows exactly the strings it was given and does not translate them", async () => {
    alert.info({ title: "nav.contact", description: "header.menuClose", duration: 60000 });
    await nextTick();
    const [item] = shown();

    expect(item!.querySelector(".alert-title")!.textContent).toBe("nav.contact");
    expect(item!.querySelector(".alert-text")!.textContent).toBe("header.menuClose");
  });
});

describe("queue", () => {
  it("shows four messages at a time and the rest as slots free up", async () => {
    for (let index = 1; index <= 6; index += 1) alert.info({ title: `m${index}`, duration: 60000 });
    await nextTick();
    expect(titles()).toEqual(["m1", "m2", "m3", "m4"]);

    host()!.querySelector<HTMLButtonElement>(".alert-close")!.click();
    await nextTick();
    expect(titles()).toEqual(["m2", "m3", "m4", "m5"]);

    host()!
      .querySelector<HTMLButtonElement>(".alert:not(.alert-leave-active) .alert-close")!
      .click();
    await nextTick();
    expect(titles()).toEqual(["m3", "m4", "m5", "m6"]);
  });

  it("removes a message by id", async () => {
    alert.info({ title: "keep", duration: 60000 });
    const id = alert.info({ title: "drop", duration: 60000 });
    alert.remove(id);
    await nextTick();

    expect(titles()).toEqual(["keep"]);
  });

  it("clears the visible and the waiting messages", async () => {
    for (let index = 1; index <= 6; index += 1) alert.info({ title: `m${index}`, duration: 60000 });
    await nextTick();
    alert.clear();
    await nextTick();

    expect(titles()).toEqual([]);
  });

  it("starts the timer when a waiting message becomes visible", async () => {
    for (let index = 1; index <= 4; index += 1) alert.info({ title: `m${index}`, duration: 300 });
    alert.info({ title: "waiting", duration: 600 });
    await nextTick();
    expect(titles()).toEqual(["m1", "m2", "m3", "m4"]);

    await expect.poll(titles).toEqual(["waiting"]);
    await wait(400);
    expect(titles()).toEqual(["waiting"]);
    await expect.poll(titles).toEqual([]);
  });
});

describe("show time", () => {
  it("removes a message after its own duration", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    alert.success({ title: "short", duration: 1000 });
    alert.error({ title: "long", duration: 3000 });
    await nextTick();

    vi.advanceTimersByTime(999);
    await nextTick();
    expect(titles()).toEqual(["short", "long"]);

    vi.advanceTimersByTime(1);
    await nextTick();
    expect(titles()).toEqual(["long"]);

    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(titles()).toEqual([]);
  });

  it("grows with the length of the text and stops growing at a ceiling", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    alert.info({ title: "Hi" });
    alert.info({ title: "t".repeat(60), description: "d".repeat(40) });
    alert.info({ title: "t".repeat(3000) });
    alert.info({ title: "t".repeat(9000) });
    await nextTick();
    expect(shown()).toHaveLength(4);

    vi.advanceTimersByTime(4000);
    await nextTick();
    expect(shown()).toHaveLength(3);
    expect(titles()[0]).toBe("t".repeat(60));

    vi.advanceTimersByTime(4000);
    await nextTick();
    expect(shown()).toHaveLength(2);

    vi.advanceTimersByTime(4000);
    await nextTick();
    expect(shown()).toHaveLength(0);
  });

  it("takes an explicit duration over the computed one", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    alert.info({ title: "t".repeat(100), description: "d".repeat(100), duration: 500 });
    await nextTick();
    vi.advanceTimersByTime(500);
    await nextTick();

    expect(shown()).toHaveLength(0);
  });

  it("keeps a message with an infinite duration until it is closed", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const id = alert.info({ title: "sticky", duration: Infinity });
    await nextTick();
    vi.advanceTimersByTime(60000);
    await nextTick();
    expect(titles()).toEqual(["sticky"]);

    alert.remove(id);
    await nextTick();
    expect(titles()).toEqual([]);
  });

  it("holds the timer while the pointer is over the message", async () => {
    alert.info({ title: "hover", duration: 300 });
    await nextTick();
    const item = shown()[0]!;

    item.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(700);
    expect(titles()).toEqual(["hover"]);

    item.dispatchEvent(new MouseEvent("mouseleave"));
    await expect.poll(titles).toEqual([]);
  });

  it("holds the timer while focus is inside the message", async () => {
    alert.info({ title: "focus", duration: 300 });
    await nextTick();
    const item = shown()[0]!;

    item.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await wait(700);
    expect(titles()).toEqual(["focus"]);

    item.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    await expect.poll(titles).toEqual([]);
  });
});

describe("motion", () => {
  it("fades the message in", async () => {
    alert.info({ title: "enter", duration: 60000 });
    await nextTick();
    const item = shown()[0]!;

    expect(item.classList.contains("alert-enter-active")).toBe(true);
    await expect.poll(() => animationsInHost().length).toBeGreaterThan(0);
    finishAnimations();
    await expect.poll(() => item.classList.contains("alert-enter-active")).toBe(false);
    expect(getComputedStyle(item).opacity).toBe("1");
  });

  it("removes a closed message from the DOM after the leave animation", async () => {
    alert.error({ title: "closing", duration: 60000 });
    await nextTick();
    await expect.poll(() => host()!.querySelectorAll(".alert-enter-active").length).toBe(0);

    host()!.querySelector<HTMLButtonElement>(".alert-close")!.click();
    await nextTick();

    expect(host()!.querySelector(".alert")!.classList.contains("alert-leave-active")).toBe(true);
    await expect.poll(() => animationsInHost().length).toBeGreaterThan(0);
    finishAnimations();
    await expect.poll(present).toBe(0);
  });

  it("appears and leaves without transitions under reduced motion", async () => {
    await setReducedMotion("reduce");
    const id = alert.info({ title: "reduced", duration: 60000 });
    await nextTick();

    expect(animationsInHost()).toHaveLength(0);
    await expect.poll(() => getComputedStyle(shown()[0]!).opacity).toBe("1");

    alert.remove(id);
    await nextTick();

    expect(animationsInHost()).toHaveLength(0);
    await expect.poll(present).toBe(0);
  });
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  const stack = async () => {
    alert.info({
      title: "Ответ в течение дня",
      description: "Обычно отвечаю в течение 24 часов.",
      duration: 60000,
    });
    alert.success({
      title: "Сообщение отправлено",
      description: "Спасибо! Скоро свяжусь с вами.",
      duration: 60000,
    });
    alert.warning({ title: "Слишком короткое сообщение", duration: 60000 });
    alert.error({
      title: "Не удалось отправить",
      description: "Проверьте email и попробуйте ещё раз.",
      duration: 60000,
    });
    await nextTick();
    finishAnimations();
    await expect.poll(() => host()!.querySelectorAll(".alert-enter-active").length).toBe(0);
    return host()!.querySelector<HTMLElement>(".toast")!;
  };

  it("stack on desktop", async () => {
    const region = await stack();

    await expect.element(page.elementLocator(region)).toMatchScreenshot(`${theme}-stack-desktop`);
  });

  it("stack on mobile", async () => {
    await page.viewport(390, 800);
    const region = await stack();

    await expect.element(page.elementLocator(region)).toMatchScreenshot(`${theme}-stack-mobile`);
  });
});
