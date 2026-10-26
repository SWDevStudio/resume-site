export type WhyRole = "user" | "assistant";
export type WhyMessageStatus = "done" | "waiting" | "streaming" | "error";

export const WHY_MESSAGE_KINDS = ["fragment", "sent", "accepted", "reply", "hint"] as const;

export type WhyMessageKind = (typeof WHY_MESSAGE_KINDS)[number];

export interface WhyMessageData {
  id: number;
  role: WhyRole;
  kind: WhyMessageKind;
  text: string;
  status: WhyMessageStatus;
  request?: string;
  projectStart?: boolean;
}

export const ROLE_BY_KIND: Record<WhyMessageKind, WhyRole> = {
  fragment: "user",
  sent: "user",
  accepted: "user",
  reply: "assistant",
  hint: "assistant",
};
