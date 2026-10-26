import {
  ASSISTANT_MESSAGE_MAX_LENGTH,
  ASSISTANT_MESSAGE_MIN_LENGTH,
  type AssistantLanguage,
} from "./contract";

export type MessageIssue = "tooShort" | "tooLong" | "repetitive";

export interface NormalizedMessage {
  text: string;
  issue: MessageIssue | null;
}

const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/giu;
const URL_SPLIT = new RegExp(`(${URL_PATTERN.source})`, "iu");
const URL_TRAILING_PUNCTUATION = /[).,;:!?\]}»]+$/u;

const SPACES_EXCEPT_NEWLINE = /[^\S\n]+/gu;
const INVISIBLE_CHARACTERS = /(?!\n)[\p{Cc}\p{Cf}]/gu;
const SPACES_AROUND_NEWLINE = / *\n */gu;
const EXTRA_BLANK_LINES = /\n{3,}/gu;
const LONG_CHARACTER_RUN = /(\D)\1{3,}/gu;

const WORD_CHARACTER = String.raw`[\p{L}\p{N}]`;
const WHOLE_WORD = String.raw`(?<!${WORD_CHARACTER})(${WORD_CHARACTER}+)`;
const WORD_SEPARATOR = String.raw`[.-]*[\s,;!?][\s,.;!?-]*`;
const SAME_WORD_AGAIN = String.raw`\1(?!${WORD_CHARACTER})`;
const REPEATED_WORD = new RegExp(`${WHOLE_WORD}(?:${WORD_SEPARATOR}${SAME_WORD_AGAIN})+`, "giu");

const WORDS = /[\p{L}\p{N}]+/gu;
const UNIQUE_WORDS_SHARE_MIN = 0.35;
const UNIQUE_WORDS_SAMPLE_MIN = 20;

const LETTERS = /\p{L}/gu;
const CYRILLIC = /\p{Script=Cyrillic}/u;
const CYRILLIC_SHARE_RU = 0.5;
const CYRILLIC_SHARE_EN = 0.15;
const LETTERS_FOR_LANGUAGE_MIN = 20;

function collapseSpaces(text: string) {
  return text.replace(SPACES_EXCEPT_NEWLINE, " ");
}

function removeInvisibleCharacters(text: string) {
  return text.replace(INVISIBLE_CHARACTERS, "");
}

function trimLines(text: string) {
  return text.replace(SPACES_AROUND_NEWLINE, "\n");
}

function limitBlankLines(text: string) {
  return text.replace(EXTRA_BLANK_LINES, "\n\n");
}

function shortenCharacterRuns(text: string) {
  return text.replace(LONG_CHARACTER_RUN, "$1$1$1");
}

function removeRepeatedWords(text: string) {
  return text.replace(REPEATED_WORD, "$1");
}

function collapseRepeatsOutsideUrls(text: string) {
  return text
    .split(URL_SPLIT)
    .map((part, index) => {
      const isUrl = index % 2 === 1;
      return isUrl ? part : removeRepeatedWords(shortenCharacterRuns(part));
    })
    .join("");
}

const cleanupSteps = [
  collapseSpaces,
  removeInvisibleCharacters,
  trimLines,
  limitBlankLines,
  collapseRepeatsOutsideUrls,
];

export function collapseText(raw: string): string {
  return cleanupSteps.reduce((text, step) => step(text), raw.normalize("NFKC")).trim();
}

export function findUrls(text: string): string[] {
  return (text.match(URL_PATTERN) ?? []).map((url) => url.replace(URL_TRAILING_PUNCTUATION, ""));
}

export function withoutUrls(text: string): string {
  return text.replace(URL_PATTERN, " ").replace(/\s+/gu, " ").trim();
}

function uniqueWordsShare(text: string) {
  const words = (text.toLowerCase().match(WORDS) ?? []).filter((word) => word.length > 1);
  if (words.length < UNIQUE_WORDS_SAMPLE_MIN) return 1;
  return new Set(words).size / words.length;
}

function issueOf(text: string): MessageIssue | null {
  if (text.length > ASSISTANT_MESSAGE_MAX_LENGTH) return "tooLong";
  if (uniqueWordsShare(withoutUrls(text)) < UNIQUE_WORDS_SHARE_MIN) return "repetitive";
  const hasLink = findUrls(text).length > 0;
  if (!hasLink && text.length < ASSISTANT_MESSAGE_MIN_LENGTH) return "tooShort";
  return null;
}

export function normalizeMessage(raw: string): NormalizedMessage {
  const text = collapseText(raw);
  return { text, issue: issueOf(text) };
}

function languageByScript(text: string): AssistantLanguage | null {
  const letters = withoutUrls(text).match(LETTERS) ?? [];
  if (letters.length < LETTERS_FOR_LANGUAGE_MIN) return null;
  const cyrillicShare = letters.filter((letter) => CYRILLIC.test(letter)).length / letters.length;
  if (cyrillicShare >= CYRILLIC_SHARE_RU) return "ru";
  if (cyrillicShare <= CYRILLIC_SHARE_EN) return "en";
  return null;
}

export function detectLanguage(
  latest: string,
  previous: string[],
  fallback: AssistantLanguage,
): AssistantLanguage {
  return languageByScript(latest) ?? languageByScript(previous.join(" ")) ?? fallback;
}
