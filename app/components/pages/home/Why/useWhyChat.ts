import { computed, onScopeDispose, ref, type MaybeRefOrGetter } from "vue";
import { useIntersectionObserver, useToggle } from "@vueuse/core";
import { $api } from "~/assets/api";
import { $metrika } from "~/assets/metrika";
import type {
  AssistantDoneEvent,
  AssistantEvent,
  AssistantRefusalEvent,
  AssistantRefusalReason,
} from "~/assets/api/types/assistant";
import { loadHistory, loadLimit, saveHistory, saveLimit } from "./whyChatHistory";
import { ROLE_BY_KIND } from "./whyChatMessage";
import type { WhyMessageData, WhyMessageKind, WhyMessageStatus } from "./whyChatMessage";
import { inputLimit, isShortRequest, mergeFragments, projectContext } from "./whyChatRequest";

export type { WhyMessageData, WhyMessageKind, WhyMessageStatus, WhyRole } from "./whyChatMessage";
export type WhyChatStatus = "idle" | "waiting" | "streaming" | "error";

interface Exchange {
  question: WhyMessageData;
  request: string;
  reply: WhyMessageData;
  controller: AbortController;
}

const LOCKING_REASONS = new Set<AssistantRefusalReason>(["limit", "blocked"]);
const RESTORE_MARGIN = "200% 0px";
const DRAFT_REASONS = new Set<AssistantRefusalReason>([
  "notProject",
  "linkUnreadable",
  "invalid",
  "unavailable",
  "captcha",
]);

export function useWhyChat(root?: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const messages = ref<WhyMessageData[]>([]);
  const status = ref<WhyChatStatus>("idle");
  const draft = ref("");
  const remaining = ref<number | null>(null);
  const [locked, toggleLocked] = useToggle(false);

  let lastId = 0;
  let restored = false;
  let active: Exchange | null = null;
  let chipText: string | null = null;

  const busy = computed(() => status.value === "waiting" || status.value === "streaming");
  const fragments = computed(() => messages.value.filter((message) => message.kind === "fragment"));
  const maxLength = computed(() => inputLimit(fragments.value.map((message) => message.text)));
  const canSend = computed(() => {
    const text = draft.value.trim();
    return !busy.value && !locked.value && text.length > 0 && text.length <= maxLength.value;
  });

  function push(kind: WhyMessageKind, text: string, state: WhyMessageStatus) {
    lastId += 1;
    messages.value.push({ id: lastId, role: ROLE_BY_KIND[kind], kind, text, status: state });
    return messages.value[messages.value.length - 1]!;
  }

  function remove(message: WhyMessageData) {
    messages.value = messages.value.filter((item) => item.id !== message.id);
  }

  function removeHint() {
    messages.value = messages.value.filter((message) => message.kind !== "hint");
  }

  function persist() {
    if (restored) saveHistory(messages.value);
  }

  function restore() {
    if (restored) return;
    const history = loadHistory().map((message) => {
      lastId += 1;
      return { ...message, id: lastId };
    });
    if (history.length) messages.value = [...history, ...messages.value];
    const limit = loadLimit();
    if (limit) {
      remaining.value = limit.remaining;
      if (limit.locked) toggleLocked(true);
    }
    restored = true;
  }

  function applyRemaining(value: number, lock: boolean) {
    remaining.value = value;
    if (lock) toggleLocked(true);
    saveLimit({ remaining: value, locked: locked.value });
  }

  function cancel() {
    const exchange = active;
    active = null;
    if (!exchange) return;
    exchange.controller.abort();
    if (exchange.reply.text) exchange.reply.status = "done";
    else remove(exchange.reply);
    status.value = "idle";
    persist();
  }

  function prepare() {
    restore();
    $api.assistant.prepare();
  }

  function fill(text: string) {
    restore();
    draft.value = text.slice(0, maxLength.value);
    chipText = draft.value.trim();
  }

  function returnDraft(text: string) {
    if (!locked.value && !draft.value) draft.value = text;
  }

  function replaceReply(exchange: Exchange) {
    remove(exchange.reply);
    exchange.reply = push("reply", "", "waiting");
    return exchange.reply;
  }

  function holdFragment(text: string) {
    push("fragment", text, "done");
    removeHint();
    push("hint", "", "done");
    persist();
  }

  function appendChunk({ reply }: Exchange, text: string) {
    reply.text += text;
    if (reply.status !== "waiting") return;
    reply.status = "streaming";
    status.value = "streaming";
  }

  function restartReply(exchange: Exchange) {
    replaceReply(exchange);
    status.value = "waiting";
  }

  function refuse(exchange: Exchange, event: AssistantRefusalEvent) {
    const reply = exchange.reply.text ? replaceReply(exchange) : exchange.reply;
    reply.text = event.message;
    reply.status = "done";
    const unavailable = event.reason === "unavailable";
    status.value = unavailable ? "error" : "idle";
    const lock = LOCKING_REASONS.has(event.reason) || (!unavailable && event.remaining === 0);
    applyRemaining(event.remaining, lock);
    if (DRAFT_REASONS.has(event.reason)) returnDraft(exchange.request);
  }

  function complete({ question, request, reply }: Exchange, event: AssistantDoneEvent) {
    if (!reply.text) throw new Error("empty answer");
    reply.status = "done";
    question.kind = "accepted";
    question.request = request;
    question.projectStart = event.project === "new";
    status.value = "idle";
    applyRemaining(event.remaining, event.remaining === 0);
  }

  function handleEvent(exchange: Exchange, event: AssistantEvent): boolean {
    switch (event.type) {
      case "chunk":
        appendChunk(exchange, event.text);
        return false;
      case "reset":
        restartReply(exchange);
        return false;
      case "refusal":
        refuse(exchange, event);
        return true;
      case "done":
        complete(exchange, event);
        return true;
    }
  }

  function fail(exchange: Exchange) {
    exchange.reply.status = "error";
    status.value = "error";
    returnDraft(exchange.request);
  }

  function startExchange(text: string, request: string): Exchange {
    for (const fragment of fragments.value) fragment.kind = "sent";
    removeHint();
    const question = push("sent", text, "done");
    const reply = push("reply", "", "waiting");
    const exchange: Exchange = { question, request, reply, controller: new AbortController() };
    active = exchange;
    status.value = "waiting";
    persist();
    return exchange;
  }

  async function ask(text: string, request: string, source: "form" | "chip") {
    $metrika.assistant.ask(source);
    const context = projectContext(messages.value);
    const exchange = startExchange(text, request);
    const { signal } = exchange.controller;
    try {
      for await (const event of $api.assistant.chat([...context, request], signal)) {
        if (signal.aborted || handleEvent(exchange, event)) return;
      }
      throw new Error("stream ended");
    } catch {
      if (!signal.aborted) fail(exchange);
    } finally {
      if (active === exchange) {
        active = null;
        persist();
      }
    }
  }

  async function send(raw: string = draft.value) {
    restore();
    const text = raw.trim();
    if (!text || locked.value) return;
    cancel();
    draft.value = "";
    const source = text === chipText ? "chip" : "form";
    chipText = null;
    const request = mergeFragments(
      fragments.value.map((message) => message.text),
      text,
    );
    if (isShortRequest(request)) holdFragment(text);
    else await ask(text, request, source);
  }

  const { stop: stopRestoreObserver } = useIntersectionObserver(
    root,
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      stopRestoreObserver();
      restore();
    },
    { rootMargin: RESTORE_MARGIN },
  );

  onScopeDispose(cancel);

  return {
    messages,
    status,
    draft,
    remaining,
    locked,
    busy,
    canSend,
    maxLength,
    send,
    fill,
    cancel,
    prepare,
  };
}
