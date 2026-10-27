import type { ContactRequest } from "../../app/assets/api/types/contact";

const TELEGRAM_TEXT_LIMIT = 4096;
const TRUNCATION_MARK = "…";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Moscow",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fitEscaped(text: string, budget: number) {
  let result = "";
  for (const char of text) {
    const escaped = escapeHtml(char);
    if (result.length + escaped.length > budget) return { text: result, truncated: true };
    result += escaped;
  }
  return { text: result, truncated: false };
}

export function buildContactMessage(input: ContactRequest, now: Date): string {
  const head = [
    "<b>Новая заявка с сайта</b>",
    `<b>Имя:</b> ${escapeHtml(input.name)}`,
    `<b>Контакт:</b> <code>${escapeHtml(input.contact)}</code>`,
    `<b>Язык страницы:</b> ${input.locale}`,
    `<b>Время:</b> ${dateFormat.format(now)} (МСК)`,
    "",
    "<b>Сообщение:</b>",
  ].join("\n");
  const reserved = head.length + "<blockquote></blockquote>".length + TRUNCATION_MARK.length;
  const body = fitEscaped(input.message, TELEGRAM_TEXT_LIMIT - reserved);
  const mark = body.truncated ? TRUNCATION_MARK : "";
  return `${head}<blockquote>${body.text}${mark}</blockquote>`;
}
