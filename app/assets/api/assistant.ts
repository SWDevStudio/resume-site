import { EventSourceParserStream } from "eventsource-parser/stream";
import type { EventSourceMessage } from "eventsource-parser/stream";
import {
  ASSISTANT_MAX_MESSAGES,
  type AssistantEvent,
  type AssistantRequest,
} from "~/assets/api/types/assistant";
import { prepareCaptcha, takeCaptcha } from "./captcha";
import { resolveLocale } from "./locale";

const CHAT_URL = "/api/assistant/chat";
const EVENT_TYPES = new Set<string>(["chunk", "reset", "done", "refusal"]);

async function buildRequest(messages: string[]): Promise<AssistantRequest> {
  const locale = resolveLocale();
  const captcha = await takeCaptcha();
  prepareCaptcha();
  return { messages: messages.slice(-ASSISTANT_MAX_MESSAGES), locale, captcha };
}

async function openStream(request: AssistantRequest, signal?: AbortSignal) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok || !response.body) throw new Error(`assistant: ${response.status}`);
  return response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());
}

async function* readMessages(
  stream: ReadableStream<EventSourceMessage>,
): AsyncGenerator<EventSourceMessage, void, undefined> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.cancel().catch(() => undefined);
  }
}

function isAssistantEvent(value: unknown): value is AssistantEvent {
  if (typeof value !== "object" || value === null || !("type" in value)) return false;
  return typeof value.type === "string" && EVENT_TYPES.has(value.type);
}

function parseEvent({ data }: EventSourceMessage): AssistantEvent | null {
  try {
    const value: unknown = JSON.parse(data);
    return isAssistantEvent(value) ? value : null;
  } catch {
    return null;
  }
}

export const assistant = {
  prepare() {
    prepareCaptcha();
  },
  async *chat(
    messages: string[],
    signal?: AbortSignal,
  ): AsyncGenerator<AssistantEvent, void, undefined> {
    const stream = await openStream(await buildRequest(messages), signal);
    for await (const message of readMessages(stream)) {
      const event = parseEvent(message);
      if (event) yield event;
    }
  },
};
