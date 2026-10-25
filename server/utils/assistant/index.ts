import type { H3Event } from "h3";
import { useSafeRuntimeConfig } from "#imports";
import type { AssistantChallenge } from "./contract";
import { issueCaptchaChallenge } from "./captcha";
import { respondToChat } from "./chat";
import type { ChatInput } from "./chat";
import { visitorFromRequest } from "./visitor";
import type { Visitor } from "./visitor";

function assistantConfig() {
  return useSafeRuntimeConfig().assistant;
}

export function identifyVisitor(event: H3Event): Promise<Visitor> {
  return visitorFromRequest(event, assistantConfig().secret);
}

export function handleChat(input: ChatInput): Promise<void> {
  return respondToChat(input, assistantConfig());
}

export function issueChallenge(): Promise<AssistantChallenge> {
  return issueCaptchaChallenge(assistantConfig().secret);
}
