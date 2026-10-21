export interface AgentContext {
  locale: string;
  reply: string;
}

export interface AgentTiming {
  thinking: number;
  chunkMin: number;
  chunkMax: number;
}

export const agentTiming: AgentTiming = {
  thinking: 700,
  chunkMin: 50,
  chunkMax: 90,
};

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function between(min: number, max: number) {
  return min + Math.random() * Math.max(0, max - min);
}

function split(text: string) {
  const words = text.match(/\S+\s*/g) ?? [];
  const chunks: string[] = [];
  for (let index = 0; index < words.length;) {
    const count = 1 + Math.floor(Math.random() * 3);
    chunks.push(words.slice(index, index + count).join(""));
    index += count;
  }
  return chunks;
}

export async function* askAgent(
  question: string,
  signal?: AbortSignal,
  context?: AgentContext,
): AsyncGenerator<string, void, undefined> {
  void question;
  await sleep(agentTiming.thinking, signal);
  const chunks = split(context?.reply ?? "");
  for (const [index, chunk] of chunks.entries()) {
    if (index > 0) await sleep(between(agentTiming.chunkMin, agentTiming.chunkMax), signal);
    signal?.throwIfAborted();
    yield chunk;
  }
}
