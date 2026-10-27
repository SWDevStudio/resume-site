import { createError, defineEventHandler, getRequestHeader, readBody } from "h3";
import type { H3Event } from "h3";
import { z } from "zod";
import { useSafeRuntimeConfig } from "#imports";
import { LOCALES } from "../../app/assets/const/locale";
import type { ContactRequest } from "../../app/assets/api/types/contact";
import { buildContactMessage } from "../utils/contactMessage";

const MAX_BODY_BYTES = 16 * 1024;

const contactRequest = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  locale: z.enum(LOCALES),
}) satisfies z.ZodType<ContactRequest>;

async function readContactBody(event: H3Event): Promise<unknown> {
  const length = Number(getRequestHeader(event, "content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  return readBody(event).catch(() => null);
}

async function sendToTelegram(text: string) {
  const { botToken, chatId } = useSafeRuntimeConfig().telegram;
  if (!botToken || !chatId) {
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
  try {
    await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      body: {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Bad Gateway" });
  }
}

export default defineEventHandler(async (event) => {
  const parsed = contactRequest.safeParse(await readContactBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });
  }
  await sendToTelegram(buildContactMessage(parsed.data, new Date()));
  return { ok: true };
});
