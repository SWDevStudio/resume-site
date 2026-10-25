import type { Locale } from "../../const/locale";

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
  locale: Locale;
  captcha: AssistantCaptcha | null;
}

export type AssistantRefusalReason =
  "limit" | "blocked" | "notProject" | "linkUnreadable" | "unavailable" | "invalid" | "captcha";

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
  language: Locale;
  project: AssistantProject;
  remaining: number;
}

export interface AssistantRefusalEvent {
  type: "refusal";
  reason: AssistantRefusalReason;
  language: Locale;
  message: string;
  remaining: number;
}

export type AssistantEvent =
  AssistantChunkEvent | AssistantResetEvent | AssistantDoneEvent | AssistantRefusalEvent;
