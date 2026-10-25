import type {
  AssistantEvent,
  AssistantLanguage,
  AssistantProject,
  AssistantRefusalReason,
} from "./contract";
import {
  describesProjectInWords,
  lastUrlIn,
  projectMessages,
  readConversation,
} from "./conversation";
import type { Conversation } from "./conversation";
import type { FailureLog } from "./failureLog";
import { classifyMessage, streamAnswer } from "./fallback";
import { loadLink } from "./link";
import type { LinkContent } from "./link";
import { answerPrompt } from "./prompts/answer";
import { isProjectLabel } from "./prompts/filter";
import type { FilterLabel } from "./prompts/filter";
import type { ProfileSource } from "./profile";
import { loadNotes } from "./prompts/notes";
import { chains, resolveChain } from "./providers";
import type { AssistantKeys } from "./providers";
import {
  readQuota,
  recordFilterAcceptance,
  recordFilterRefusal,
  refundMessage,
  releaseSiteAnswer,
  reserveSiteAnswer,
  takeMessage,
} from "./quota";
import { refusalEvent } from "./refusals";
import type { Visitor } from "./visitor";

export type ChatEmit = (event: AssistantEvent) => Promise<void>;

export interface PipelineInput {
  messages: string[];
  locale: AssistantLanguage;
  visitor: Visitor;
  keys: AssistantKeys;
  profile: ProfileSource;
  signal: AbortSignal;
  emit: ChatEmit;
  failures: FailureLog;
}

type Outcome =
  | { type: "answered"; project: AssistantProject }
  | { type: "refused"; reason: AssistantRefusalReason; remaining: number }
  | { type: "unavailable"; siteAnswerReserved: boolean };

interface ProjectLink {
  content: LinkContent | null;
  failed: boolean;
}

export async function runPipeline(input: PipelineInput): Promise<void> {
  const { visitor, emit } = input;
  const conversation = readConversation(input.messages, input.locale);
  const { language } = conversation;
  const refuse = (reason: AssistantRefusalReason, remaining: number) =>
    emit(refusalEvent(reason, language, remaining));

  const quota = await readQuota(visitor);
  if (quota.blocked) return refuse("blocked", 0);
  if (quota.remaining === 0) return refuse("limit", 0);
  if (conversation.latestIssue === "tooShort") return refuse("notProject", quota.remaining);
  if (conversation.latestIssue) return refuse("invalid", quota.remaining);

  const quotaAfterMessage = await takeMessage(visitor);
  if (!quotaAfterMessage) return refuse("limit", 0);

  const outcome = await answerProject(conversation, input, quotaAfterMessage.remaining);
  if (outcome.type === "unavailable") {
    return refuse("unavailable", await refundUnanswered(visitor, outcome.siteAnswerReserved));
  }
  if (outcome.type === "refused") return refuse(outcome.reason, outcome.remaining);
  return emit({
    type: "done",
    language,
    project: outcome.project,
    remaining: quotaAfterMessage.remaining,
  });
}

async function answerProject(
  conversation: Conversation,
  input: PipelineInput,
  remaining: number,
): Promise<Outcome> {
  const { visitor } = input;

  const label = await classifyLatest(conversation, input);
  if (!label) return { type: "unavailable", siteAnswerReserved: false };
  if (!isProjectLabel(label)) return refuseNotProject(visitor);
  await recordFilterAcceptance(visitor);

  const project = projectOf(label, conversation);
  const messages = projectMessages(conversation, project);
  const link = await readProjectLink(messages, input);
  if (link.failed && !describesProjectInWords(messages)) {
    return { type: "refused", reason: "linkUnreadable", remaining };
  }

  if (!(await reserveSiteAnswer(visitor.day))) {
    return { type: "unavailable", siteAnswerReserved: false };
  }
  const answered = await streamProjectAnswer(conversation.language, messages, link, input);
  if (!answered) return { type: "unavailable", siteAnswerReserved: true };
  return { type: "answered", project };
}

async function classifyLatest({ previous, latest }: Conversation, input: PipelineInput) {
  const steps = resolveChain(chains.filter, input.keys);
  const result = await classifyMessage(steps, { previous, latest }, input.signal);
  input.failures.add("filter", result.failures);
  return result.label;
}

async function refuseNotProject(visitor: Visitor): Promise<Outcome> {
  const quota = await recordFilterRefusal(visitor);
  if (quota.blocked) return { type: "refused", reason: "blocked", remaining: 0 };
  return { type: "refused", reason: "notProject", remaining: quota.remaining };
}

function projectOf(label: FilterLabel, { previous }: Conversation): AssistantProject {
  return label === "UPDATE" && previous.length > 0 ? "continued" : "new";
}

async function readProjectLink(messages: string[], input: PipelineInput): Promise<ProjectLink> {
  const url = lastUrlIn(messages);
  if (!url) return { content: null, failed: false };
  const { content, failure } = await loadLink(url, input.keys.githubToken, input.signal);
  if (failure) input.failures.add("link", [failure]);
  return { content, failed: !content };
}

async function streamProjectAnswer(
  language: AssistantLanguage,
  messages: string[],
  link: ProjectLink,
  { keys, profile, signal, emit, failures }: PipelineInput,
) {
  const prompt = answerPrompt({
    language,
    messages,
    link: link.content,
    linkFailed: link.failed,
    notes: await loadNotes(),
    profile: await profile(language),
  });
  const result = await streamAnswer(resolveChain(chains.answer[language], keys), prompt, signal, {
    chunk: (text) => void emit({ type: "chunk", text }),
    reset: () => void emit({ type: "reset" }),
  });
  failures.add("answer", result.failures);
  return result.ok;
}

async function refundUnanswered(visitor: Visitor, siteAnswerReserved: boolean) {
  if (siteAnswerReserved) await releaseSiteAnswer(visitor.day);
  const quota = await refundMessage(visitor);
  return quota.remaining;
}
