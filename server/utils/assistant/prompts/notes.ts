import { useStorage } from "nitropack/runtime";

const NOTES_FILE = "assistant-notes.md";
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const SECTION_START = /^(?=#{1,6} )/m;
const HEADING_LINE = /^#{1,6} .*$/gm;

function hasContent(section: string) {
  return section.replace(HEADING_LINE, "").trim() !== "";
}

export function cleanNotes(raw: string): string {
  const text = raw.replace(HTML_COMMENT, "").replace(/\r\n/g, "\n");
  return text
    .split(SECTION_START)
    .map((section) => section.trim())
    .filter(hasContent)
    .join("\n\n");
}

export async function loadNotes(): Promise<string> {
  try {
    const raw = await useStorage("assets:server").getItem(NOTES_FILE);
    return typeof raw === "string" ? cleanNotes(raw) : "";
  } catch {
    return "";
  }
}
