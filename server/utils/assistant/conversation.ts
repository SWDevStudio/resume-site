import {
  ASSISTANT_MESSAGE_MIN_LENGTH,
  type AssistantLanguage,
  type AssistantProject,
} from "./contract";
import { detectLanguage, findUrls, normalizeMessage, withoutUrls } from "./text";
import type { MessageIssue, NormalizedMessage } from "./text";

const CONTEXT_MAX_CHARS = 4_000;

export interface Conversation {
  previous: string[];
  latest: string;
  latestIssue: MessageIssue | null;
  language: AssistantLanguage;
}

function isUsableContext({ text, issue }: NormalizedMessage) {
  return text !== "" && issue !== "tooLong" && issue !== "repetitive";
}

function keepRecent(messages: string[]): string[] {
  const recent: string[] = [];
  let length = 0;
  for (const message of [...messages].reverse()) {
    if (recent.length > 0 && length + message.length > CONTEXT_MAX_CHARS) break;
    recent.unshift(message);
    length += message.length;
  }
  return recent;
}

export function readConversation(rawMessages: string[], locale: AssistantLanguage): Conversation {
  const messages = rawMessages.map(normalizeMessage);
  const latest = messages.at(-1)!;
  const earlier = messages.slice(0, -1).filter(isUsableContext);
  const previous = keepRecent([...earlier, latest].map(({ text }) => text)).slice(0, -1);
  return {
    previous,
    latest: latest.text,
    latestIssue: latest.issue,
    language: detectLanguage(latest.text, previous, locale),
  };
}

export function projectMessages({ previous, latest }: Conversation, project: AssistantProject) {
  return project === "new" ? [latest] : [...previous, latest];
}

export function lastUrlIn(messages: string[]): string | null {
  for (const message of [...messages].reverse()) {
    const [url] = findUrls(message);
    if (url) return url;
  }
  return null;
}

export function describesProjectInWords(messages: string[]) {
  return messages.some((message) => withoutUrls(message).length >= ASSISTANT_MESSAGE_MIN_LENGTH);
}
