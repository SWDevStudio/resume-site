import { createEventStream, defineEventHandler, getRequestHeader, readBody } from "h3";
import type { H3Event } from "h3";
import { handleChat, identifyVisitor } from "../../utils/assistant";
import { assistantProfile } from "../../utils/assistantProfile";

const MAX_BODY_BYTES = 64 * 1024;

async function readChatBody(event: H3Event): Promise<unknown> {
  const length = Number(getRequestHeader(event, "content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  return readBody(event).catch(() => null);
}

export default defineEventHandler(async (event) => {
  const visitor = await identifyVisitor(event);
  const stream = createEventStream(event, { autoclose: false });
  const controller = new AbortController();
  event.node.res.on("close", () => controller.abort(new Error("client closed")));
  const body = await readChatBody(event);

  void handleChat({
    visitor,
    body,
    profile: assistantProfile,
    signal: controller.signal,
    emit: (message) => stream.push(JSON.stringify(message)),
  }).finally(() => stream.close());

  return stream.send();
});
