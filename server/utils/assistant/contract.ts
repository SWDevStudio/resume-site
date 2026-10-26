export const ASSISTANT_LANGUAGES = ["ru", "en"] as const;

export type AssistantLanguage = (typeof ASSISTANT_LANGUAGES)[number];

export const DEFAULT_ASSISTANT_LANGUAGE: AssistantLanguage = "ru";

export const ASSISTANT_MESSAGE_MIN_LENGTH = 150;
export const ASSISTANT_MESSAGE_MAX_LENGTH = 2000;
export const ASSISTANT_MAX_MESSAGES = 10;

export interface AssistantChallengeParameters {
  algorithm: string;
  nonce: string;
  salt: string;
  cost: number;
  keyLength: number;
  keyPrefix: string;
  keySignature: string;
  expiresAt: number;
}

export interface AssistantChallenge {
  parameters: AssistantChallengeParameters;
  signature: string;
}

export interface AssistantCaptchaSolution {
  counter: number;
  derivedKey: string;
}

export interface AssistantCaptcha {
  challenge: AssistantChallenge;
  solution: AssistantCaptchaSolution;
}

export interface AssistantRequest {
  messages: string[];
  locale: AssistantLanguage;
  captcha: AssistantCaptcha | null;
}

export const ASSISTANT_REFUSAL_REASONS = [
  "limit",
  "blocked",
  "notProject",
  "linkUnreadable",
  "unavailable",
  "invalid",
  "captcha",
] as const;

export type AssistantRefusalReason = (typeof ASSISTANT_REFUSAL_REASONS)[number];

export interface AssistantChunkEvent {
  type: "chunk";
  text: string;
}

export interface AssistantResetEvent {
  type: "reset";
}

export type AssistantProject = "new" | "continued";

export interface AssistantDoneEvent {
  type: "done";
  language: AssistantLanguage;
  project: AssistantProject;
  remaining: number;
}

export interface AssistantRefusalEvent {
  type: "refusal";
  reason: AssistantRefusalReason;
  language: AssistantLanguage;
  message: string;
  remaining: number;
}

export type AssistantEvent =
  AssistantChunkEvent | AssistantResetEvent | AssistantDoneEvent | AssistantRefusalEvent;
