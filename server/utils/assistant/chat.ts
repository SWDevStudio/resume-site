import { z } from "zod";
import {
  ASSISTANT_LANGUAGES,
  ASSISTANT_MAX_MESSAGES,
  ASSISTANT_MESSAGE_MAX_LENGTH,
  DEFAULT_ASSISTANT_LANGUAGE,
  type AssistantRefusalReason,
} from "./contract";
import { verifyCaptcha } from "./captcha";
import { createFailureLog } from "./failureLog";
import { runPipeline } from "./pipeline";
import type { ChatEmit } from "./pipeline";
import type { ProfileSource } from "./profile";
import type { AssistantKeys } from "./providers";
import { readQuota, removeStaleCounters } from "./quota";
import { refusalEvent } from "./refusals";
import type { Visitor } from "./visitor";

const requestSchema = z.object({
  messages: z
    .array(z.string().max(ASSISTANT_MESSAGE_MAX_LENGTH * 2))
    .min(1)
    .max(ASSISTANT_MAX_MESSAGES),
  locale: z.enum(ASSISTANT_LANGUAGES),
});

export interface AssistantConfig extends AssistantKeys {
  secret: string;
}

export interface ChatInput {
  visitor: Visitor;
  body: unknown;
  profile: ProfileSource;
  signal: AbortSignal;
  emit: ChatEmit;
}

function captchaOf(body: unknown): unknown {
  if (typeof body !== "object" || body === null || !("captcha" in body)) return null;
  return body.captcha;
}

function describeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function respondToChat(
  { visitor, body, profile, signal, emit }: ChatInput,
  config: AssistantConfig,
): Promise<void> {
  void removeStaleCounters(visitor.day).catch(() => undefined);
  const parsed = requestSchema.safeParse(body);
  const request = parsed.success ? parsed.data : null;
  const language = request?.locale ?? DEFAULT_ASSISTANT_LANGUAGE;
  const failures = createFailureLog();

  const refuse = async (reason: AssistantRefusalReason) => {
    const quota = await readQuota(visitor);
    return emit(refusalEvent(reason, language, quota.remaining));
  };

  try {
    if (!(await verifyCaptcha(captchaOf(body), config.secret))) return await refuse("captcha");
    if (!request) return await refuse("invalid");
    return await runPipeline({
      ...request,
      visitor,
      keys: config,
      profile,
      signal,
      emit,
      failures,
    });
  } catch (error) {
    if (signal.aborted) return;
    failures.add("request", [describeError(error)]);
    const quota = await readQuota(visitor).catch(() => ({ remaining: 0 }));
    await emit(refusalEvent("unavailable", language, quota.remaining));
  } finally {
    failures.flush();
  }
}
