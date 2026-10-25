import { ROLE_BY_KIND, WHY_MESSAGE_KINDS } from "./whyChatMessage";
import type { WhyMessageData, WhyMessageKind } from "./whyChatMessage";

export type StoredMessage = Omit<WhyMessageData, "id" | "role">;

export interface StoredLimit {
  remaining: number;
  locked: boolean;
}

const HISTORY_KEY = "why-chat-history";
const LIMIT_KEY = "why-chat-limit";

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function readStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isKind(value: unknown): value is WhyMessageKind {
  return WHY_MESSAGE_KINDS.some((kind) => kind === value);
}

function isStoredMessage(value: unknown): value is StoredMessage {
  if (!isRecord(value)) return false;
  const { kind, text, status, request, projectStart } = value;
  const finished = status === "done" || status === "error";
  if (!isKind(kind) || !finished || typeof text !== "string") return false;
  if (kind !== "accepted") return true;
  return typeof request === "string" && typeof projectStart === "boolean";
}

function toStored({ kind, text, status, request, projectStart }: WhyMessageData): StoredMessage {
  return { kind, text, status, request, projectStart };
}

export function loadHistory(): Omit<WhyMessageData, "id">[] {
  const history = readStorage(HISTORY_KEY);
  const stored = Array.isArray(history) ? history.filter(isStoredMessage) : [];
  return stored.map((message) => ({ ...message, role: ROLE_BY_KIND[message.kind] }));
}

export function saveHistory(messages: WhyMessageData[]) {
  const finished = messages.filter(
    (message) => message.status === "done" || message.status === "error",
  );
  writeStorage(HISTORY_KEY, finished.map(toStored));
}

export function loadLimit(): StoredLimit | null {
  const limit = readStorage(LIMIT_KEY);
  if (!isRecord(limit) || limit.day !== utcDay()) return null;
  const { remaining, locked } = limit;
  if (typeof remaining !== "number" || typeof locked !== "boolean") return null;
  return { remaining, locked };
}

export function saveLimit({ remaining, locked }: StoredLimit) {
  writeStorage(LIMIT_KEY, { day: utcDay(), remaining, locked });
}
