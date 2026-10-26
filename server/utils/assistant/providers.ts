import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { JSONValue, LanguageModel, streamText } from "ai";
import type { AssistantLanguage } from "./contract";

type CallOptions = Parameters<typeof streamText>[0];

export interface AssistantKeys {
  groqKey: string;
  cloudflareAccountId: string;
  cloudflareToken: string;
  openrouterKey: string;
  githubToken: string;
}

export type ProviderId = "groq" | "cloudflare" | "github" | "openrouter";

export type ModelFactory = (modelId: string) => LanguageModel;

export interface ProviderStrategy {
  id: ProviderId;
  create(keys: AssistantKeys, fetch?: typeof globalThis.fetch): ModelFactory | null;
}

export interface StepParams {
  reasoning?: CallOptions["reasoning"];
  providerOptions?: CallOptions["providerOptions"];
}

export interface ChainStep {
  provider: ProviderId;
  model: string;
  maxTokens: number;
  reasoning?: CallOptions["reasoning"];
  extra?: Record<string, JSONValue>;
}

export interface ResolvedStep {
  id: string;
  model: LanguageModel;
  maxTokens: number;
  params: StepParams;
}

export const ANSWER_MAX_TOKENS = 400;
export const REASONING_RESERVE = 300;
const FILTER_MAX_TOKENS = 16;
const FILTER_REASONING_MAX_TOKENS = 300;

function openAICompatible(
  id: ProviderId,
  access: (keys: AssistantKeys) => { baseURL: string; apiKey: string } | null,
): ProviderStrategy {
  return {
    id,
    create(keys, fetch) {
      const settings = access(keys);
      if (!settings) return null;
      const provider = createOpenAICompatible({ name: id, includeUsage: true, fetch, ...settings });
      return (modelId) => provider.chatModel(modelId);
    },
  };
}

const strategies: Record<ProviderId, ProviderStrategy> = {
  groq: openAICompatible("groq", ({ groqKey }) =>
    groqKey ? { baseURL: "https://api.groq.com/openai/v1", apiKey: groqKey } : null,
  ),
  cloudflare: openAICompatible("cloudflare", ({ cloudflareAccountId, cloudflareToken }) =>
    cloudflareAccountId && cloudflareToken
      ? {
          baseURL: `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/v1`,
          apiKey: cloudflareToken,
        }
      : null,
  ),
  github: openAICompatible("github", ({ githubToken }) =>
    githubToken ? { baseURL: "https://models.github.ai/inference", apiKey: githubToken } : null,
  ),
  openrouter: openAICompatible("openrouter", ({ openrouterKey }) =>
    openrouterKey ? { baseURL: "https://openrouter.ai/api/v1", apiKey: openrouterKey } : null,
  ),
};

const filterChain: ChainStep[] = [
  {
    provider: "groq",
    model: "openai/gpt-oss-20b",
    maxTokens: FILTER_REASONING_MAX_TOKENS,
    reasoning: "low",
  },
  {
    provider: "cloudflare",
    model: "@cf/mistralai/mistral-small-3.1-24b-instruct",
    maxTokens: FILTER_MAX_TOKENS,
  },
  {
    provider: "openrouter",
    model: "nvidia/nemotron-3.5-lightning:free",
    maxTokens: FILTER_MAX_TOKENS,
    extra: { reasoning: { enabled: false } },
  },
];

const mainChain: ChainStep[] = [
  {
    provider: "groq",
    model: "openai/gpt-oss-120b",
    maxTokens: ANSWER_MAX_TOKENS + REASONING_RESERVE,
    reasoning: "low",
  },
  {
    provider: "cloudflare",
    model: "@cf/openai/gpt-oss-120b",
    maxTokens: ANSWER_MAX_TOKENS + REASONING_RESERVE,
    reasoning: "low",
  },
  {
    provider: "github",
    model: "openai/gpt-4.1-mini",
    maxTokens: ANSWER_MAX_TOKENS,
  },
  {
    provider: "openrouter",
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    maxTokens: ANSWER_MAX_TOKENS + REASONING_RESERVE,
    extra: { reasoning: { effort: "low" } },
  },
  {
    provider: "openrouter",
    model: "google/gemma-4-31b-it:free",
    maxTokens: ANSWER_MAX_TOKENS,
  },
];

export const chains: { filter: ChainStep[]; answer: Record<AssistantLanguage, ChainStep[]> } = {
  filter: filterChain,
  answer: {
    ru: mainChain,
    en: mainChain,
  },
};

export function resolveChain(
  steps: ChainStep[],
  keys: AssistantKeys,
  fetch?: typeof globalThis.fetch,
): ResolvedStep[] {
  const factories = new Map<ProviderId, ModelFactory | null>();
  return steps.flatMap((step) => {
    if (!factories.has(step.provider)) {
      factories.set(step.provider, strategies[step.provider].create(keys, fetch));
    }
    const factory = factories.get(step.provider);
    if (!factory) return [];
    return [
      {
        id: `${step.provider}/${step.model}`,
        model: factory(step.model),
        maxTokens: step.maxTokens,
        params: {
          reasoning: step.reasoning,
          providerOptions: step.extra ? { [step.provider]: step.extra } : undefined,
        },
      },
    ];
  });
}
