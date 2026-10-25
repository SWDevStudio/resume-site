import { complete, stream } from "./llm";
import type { ChatPrompt } from "./llm";
import { filterPrompt, parseFilterLabel } from "./prompts/filter";
import type { FilterInput, FilterLabel } from "./prompts/filter";
import type { ResolvedStep } from "./providers";

export interface AnswerSink {
  chunk(text: string): void;
  reset(): void;
}

export interface ClassifyResult {
  label: FilterLabel | null;
  failures: string[];
}

export interface AnswerResult {
  ok: boolean;
  failures: string[];
}

function describeFailure(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function classifyMessage(
  steps: ResolvedStep[],
  input: FilterInput,
  signal: AbortSignal,
): Promise<ClassifyResult> {
  const prompt = filterPrompt(input);
  const failures: string[] = [];
  for (const step of steps) {
    try {
      const label = parseFilterLabel(await complete(step, prompt, signal));
      if (label) return { label, failures };
      failures.push(`${step.id}: unparsable label`);
    } catch (error) {
      if (signal.aborted) throw error;
      failures.push(describeFailure(error));
    }
  }
  return { label: null, failures };
}

export async function streamAnswer(
  steps: ResolvedStep[],
  prompt: ChatPrompt,
  signal: AbortSignal,
  sink: AnswerSink,
): Promise<AnswerResult> {
  const failures: string[] = [];
  for (const step of steps) {
    let started = false;
    try {
      for await (const text of stream(step, prompt, signal)) {
        started = true;
        sink.chunk(text);
      }
      return { ok: true, failures };
    } catch (error) {
      if (signal.aborted) throw error;
      failures.push(describeFailure(error));
      if (started) sink.reset();
    }
  }
  return { ok: false, failures };
}
