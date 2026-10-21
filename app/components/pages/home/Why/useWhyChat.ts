import { computed, onScopeDispose, ref } from "vue";
import { useI18n } from "vue-i18n";
import { askAgent } from "./whyAgent";

export const WHY_CHAT_MAX_LENGTH = 300;

export type WhyRole = "user" | "assistant";
export type WhyMessageStatus = "done" | "waiting" | "streaming" | "error";
export type WhyChatStatus = "idle" | "waiting" | "streaming" | "error";

export interface WhyMessageData {
  id: number;
  role: WhyRole;
  text: string;
  status: WhyMessageStatus;
}

export function useWhyChat() {
  const { t, locale } = useI18n();

  const messages = ref<WhyMessageData[]>([]);
  const status = ref<WhyChatStatus>("idle");
  const draft = ref("");

  let lastId = 0;
  let controller: AbortController | null = null;
  let activeReply: WhyMessageData | null = null;

  const busy = computed(() => status.value === "waiting" || status.value === "streaming");
  const canSend = computed(() => !busy.value && draft.value.trim().length > 0);

  function push(role: WhyRole, text: string, state: WhyMessageStatus) {
    lastId += 1;
    messages.value.push({ id: lastId, role, text, status: state });
    return messages.value[messages.value.length - 1]!;
  }

  function cancel() {
    controller?.abort();
    controller = null;
    const reply = activeReply;
    activeReply = null;
    if (!reply) return;
    if (reply.text) reply.status = "done";
    else messages.value = messages.value.filter((message) => message.id !== reply.id);
  }

  function fill(text: string) {
    draft.value = text.slice(0, WHY_CHAT_MAX_LENGTH);
  }

  async function send(raw: string = draft.value) {
    const question = raw.trim();
    if (!question) return;

    cancel();
    const current = new AbortController();
    controller = current;
    draft.value = "";
    push("user", question, "done");
    const reply = push("assistant", "", "waiting");
    activeReply = reply;
    status.value = "waiting";

    try {
      const stream = askAgent(question, current.signal, {
        locale: locale.value,
        reply: t("home.why.chat.mockReply"),
      });
      for await (const chunk of stream) {
        if (current.signal.aborted) return;
        reply.text += chunk;
        if (reply.status === "waiting") {
          reply.status = "streaming";
          status.value = "streaming";
        }
      }
      if (current.signal.aborted) return;
      if (!reply.text) throw new Error("empty answer");
      reply.status = "done";
      status.value = "idle";
    } catch {
      if (current.signal.aborted) return;
      reply.status = "error";
      status.value = "error";
      if (!draft.value) draft.value = question;
    } finally {
      if (controller === current) {
        controller = null;
        activeReply = null;
      }
    }
  }

  onScopeDispose(cancel);

  return { messages, status, draft, busy, canSend, send, fill, cancel };
}
