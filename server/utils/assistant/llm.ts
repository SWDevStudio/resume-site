import { generateText, streamText } from "ai";
import type { ResolvedStep } from "./providers";

export interface ChatPrompt {
  system: string;
  user: string;
}

export class ProviderError extends Error {}

const REQUEST_TIMEOUT = 20_000;
const TOTAL_TIMEOUT = 60_000;

function failure(step: ResolvedStep, error: unknown) {
  if (error instanceof ProviderError) return error;
  const reason = error instanceof Error ? error.message : String(error);
  return new ProviderError(`${step.id}: ${reason}`);
}

function request(step: ResolvedStep, prompt: ChatPrompt, signal: AbortSignal) {
  return {
    model: step.model,
    instructions: prompt.system,
    prompt: prompt.user,
    maxOutputTokens: step.maxTokens,
    reasoning: step.params.reasoning,
    providerOptions: step.params.providerOptions,
    maxRetries: 0,
    abortSignal: signal,
  };
}

export async function complete(
  step: ResolvedStep,
  prompt: ChatPrompt,
  signal: AbortSignal,
): Promise<string> {
  try {
    const result = await generateText({
      ...request(step, prompt, signal),
      timeout: REQUEST_TIMEOUT,
    });
    const text = result.text.trim();
    if (!text) throw new ProviderError(`${step.id}: empty answer`);
    return text;
  } catch (error) {
    if (signal.aborted) throw error;
    throw failure(step, error);
  }
}

export async function* stream(
  step: ResolvedStep,
  prompt: ChatPrompt,
  signal: AbortSignal,
): AsyncGenerator<string, void, undefined> {
  let produced = false;
  const waiting = new AbortController();
  const timer = setTimeout(() => waiting.abort(new Error("first chunk timeout")), REQUEST_TIMEOUT);
  try {
    const result = streamText({
      ...request(step, prompt, AbortSignal.any([signal, waiting.signal])),
      timeout: { totalMs: TOTAL_TIMEOUT, chunkMs: REQUEST_TIMEOUT },
      onError: () => undefined,
    });
    for await (const part of result.fullStream) {
      if (part.type === "error") throw failure(step, part.error);
      if (part.type === "abort")
        throw new ProviderError(`${step.id}: aborted ${part.reason ?? ""}`);
      if (part.type === "reasoning-delta") clearTimeout(timer);
      if (part.type !== "text-delta" || !part.text) continue;
      clearTimeout(timer);
      produced ||= part.text.trim() !== "";
      yield part.text;
    }
    if (!produced) throw new ProviderError(`${step.id}: empty answer`);
  } catch (error) {
    if (signal.aborted) throw error;
    throw failure(step, error);
  } finally {
    clearTimeout(timer);
  }
}
