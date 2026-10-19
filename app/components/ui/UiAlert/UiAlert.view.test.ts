import { h, type VNodeChild } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import UiAlert from "./UiAlert.vue";
import { ALERT_STATUSES, type AlertStatus } from "./alertStatus";
import "~/assets/css/fonts.css";
import "~/assets/css/main.css";

interface AlertCase {
  name: string;
  class?: string;
  status?: AlertStatus;
  closable?: boolean;
  closeLabel?: string;
  title?: string;
  text?: string;
}

const themes = ["torii-synth", "cyber-sakura"];

const cases: AlertCase[] = [
  { name: "alert", title: "Ответ в течение дня", text: "Обычно отвечаю в течение 24 часов." },
  {
    name: "alert-info",
    class: "alert-info",
    title: "Ответ в течение дня",
    text: "Обычно отвечаю в течение 24 часов.",
  },
  {
    name: "alert-success",
    class: "alert-success",
    title: "Сообщение отправлено",
    text: "Спасибо! Скоро свяжусь с вами.",
  },
  {
    name: "alert-warning",
    class: "alert-warning",
    title: "Слишком короткое сообщение",
    text: "Опишите задачу хотя бы в паре фраз.",
  },
  {
    name: "alert-error",
    class: "alert-error",
    title: "Не удалось отправить",
    text: "Проверьте email и попробуйте ещё раз.",
  },
  { name: "title-only", class: "alert-success", title: "Сообщение отправлено" },
  { name: "text-only", class: "alert-warning", text: "Опишите задачу хотя бы в паре фраз." },
  {
    name: "status-info",
    status: "info",
    title: "Ответ в течение дня",
    text: "Обычно отвечаю в течение 24 часов.",
  },
  {
    name: "closable-success",
    status: "success",
    closable: true,
    title: "Сообщение отправлено",
    text: "Спасибо! Скоро свяжусь с вами.",
  },
  {
    name: "closable-error",
    status: "error",
    closable: true,
    title: "Не удалось отправить",
    text: "Проверьте email и попробуйте ещё раз.",
  },
];

const switchCases: AlertCase[] = [cases[2]!, cases[9]!];

const content = (item: AlertCase) => {
  const slots: Record<string, () => VNodeChild> = {};
  if (item.title) slots.title = () => item.title;
  if (item.text) slots.default = () => item.text;
  return slots;
};

const finishAnimations = () => {
  for (const animation of document.getAnimations()) animation.finish();
};

const renderAlert = (item: AlertCase, onClose?: () => void) =>
  render(() =>
    h(
      "div",
      { class: "inline-block bg-base-100 p-4 font-body font-light text-base-content" },
      h(
        "div",
        { class: "w-95" },
        h(
          UiAlert,
          {
            class: item.class,
            status: item.status,
            closable: item.closable,
            closeLabel: item.closeLabel,
            onClose,
          },
          content(item),
        ),
      ),
    ),
  );

beforeAll(async () => {
  await document.fonts.load('300 1em "Martian Mono"', "Ответ в течение дня Обычно отвечаю");
  await document.fonts.load('400 1em "Martian Mono"', "Ответ в течение дня");
});

describe.each(themes)("%s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  it.each(cases)("$name", async (item) => {
    const screen = await renderAlert(item);

    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toMatchScreenshot(`${theme}-${item.name}`);
  });
});

describe("semantics", () => {
  it.each([
    ["info", "status"],
    ["success", "status"],
    ["warning", "alert"],
    ["error", "alert"],
  ] as const)("%s message has role %s", async (status, role) => {
    const screen = await renderAlert({ name: status, status, title: "Title" });

    expect(screen.container.querySelector(".alert")!.getAttribute("role")).toBe(role);
  });

  it.each(ALERT_STATUSES)("%s status sets the matching modifier", async (status) => {
    const screen = await renderAlert({ name: status, status, title: "Title" });

    expect(screen.container.querySelector(".alert")!.classList.contains(`alert-${status}`)).toBe(
      true,
    );
  });

  it("has no close button by default", async () => {
    const screen = await renderAlert({ name: "x", status: "info", title: "Title" });

    expect(screen.container.querySelector(".alert-close")).toBeNull();
  });

  it("labels the close button with Close by default", async () => {
    const screen = await renderAlert({ name: "x", status: "info", closable: true, title: "T" });

    expect(screen.container.querySelector(".alert-close")!.getAttribute("aria-label")).toBe(
      "Close",
    );
  });

  it("labels the close button with the given closeLabel", async () => {
    const screen = await renderAlert({
      name: "x",
      status: "info",
      closable: true,
      closeLabel: "Закрыть уведомление",
      title: "T",
    });

    expect(screen.container.querySelector(".alert-close")!.getAttribute("aria-label")).toBe(
      "Закрыть уведомление",
    );
  });

  it("emits close from the button", async () => {
    let closed = 0;
    const screen = await renderAlert(
      { name: "x", status: "info", closable: true, title: "Title" },
      () => {
        closed += 1;
      },
    );

    screen.container.querySelector<HTMLButtonElement>(".alert-close")!.click();

    expect(closed).toBe(1);
  });
});

describe.each(themes)("close button %s", (theme) => {
  beforeEach(() => {
    document.documentElement.dataset.theme = theme;
  });

  afterEach(async () => {
    finishAnimations();
    await userEvent.unhover(page.elementLocator(document.body));
    finishAnimations();
  });

  it("highlights on hover with a transition", async () => {
    const screen = await renderAlert({ name: "x", status: "error", closable: true, title: "T" });
    finishAnimations();
    const button = screen.container.querySelector<HTMLButtonElement>(".alert-close")!;
    const rest = getComputedStyle(button).color;

    await userEvent.hover(page.elementLocator(button));
    await expect.poll(() => document.getAnimations().length).toBeGreaterThan(0);
    finishAnimations();

    expect(getComputedStyle(button).color).not.toBe(rest);
  });
});

describe("theme switch", () => {
  afterEach(finishAnimations);

  it.each(switchCases)("$name", async (item) => {
    document.documentElement.dataset.theme = "torii-synth";
    const screen = await renderAlert(item);
    screen.container.getBoundingClientRect();
    document.documentElement.dataset.theme = "cyber-sakura";

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
