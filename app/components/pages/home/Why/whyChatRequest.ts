import {
  ASSISTANT_MESSAGE_MAX_LENGTH,
  ASSISTANT_MESSAGE_MIN_LENGTH,
} from "~/assets/api/types/assistant";
import type { WhyMessageData } from "./whyChatMessage";

const LINK_PATTERN = /https?:\/\/\S/iu;
const FRAGMENT_SEPARATOR = "\n";

function compact(text: string) {
  return text.replace(/\s+/gu, " ").trim();
}

export function mergeFragments(fragments: string[], text: string) {
  return [...fragments.map(compact), text].join(FRAGMENT_SEPARATOR);
}

export function isShortRequest(request: string) {
  return !LINK_PATTERN.test(request) && compact(request).length < ASSISTANT_MESSAGE_MIN_LENGTH;
}

export function inputLimit(fragments: string[]) {
  return fragments.reduce(
    (left, fragment) => left - compact(fragment).length - FRAGMENT_SEPARATOR.length,
    ASSISTANT_MESSAGE_MAX_LENGTH,
  );
}

export function projectContext(messages: WhyMessageData[]) {
  const accepted = messages.filter((message) => message.kind === "accepted");
  const start = accepted.findLastIndex((message) => message.projectStart === true);
  return accepted.slice(Math.max(start, 0)).map((message) => message.request ?? message.text);
}
