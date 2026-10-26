const DATA_TAGS = /<\/?(visitor_message|page_content|previous_messages|latest_message)\b[^>]*>/gi;

export function escapeData(text: string) {
  return text.replace(DATA_TAGS, "");
}

export function visitorMessagesBlock(messages: string[]) {
  return messages
    .map((message) => `<visitor_message>\n${escapeData(message)}\n</visitor_message>`)
    .join("\n");
}
