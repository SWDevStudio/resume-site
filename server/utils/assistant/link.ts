import http from "node:http";
import type { IncomingMessage } from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { useAgent } from "request-filtering-agent";

export interface LinkContent {
  url: string;
  text: string;
}

const TIMEOUT = 5_000;
const MAX_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 3;
const TEXT_LIMIT = 3_000;
const TEXT_MIN = 80;
const USER_AGENT = "Mozilla/5.0 (compatible; SowaDevAssistant/1.0)";
const TEXT_TYPES = ["text/html", "application/xhtml+xml", "text/plain", "text/markdown"];
const NOISE = "script, style, noscript, svg, template, iframe, canvas, nav, footer, form";
const FILTERED_ADDRESS_MESSAGE = "is not allowed";

type ReadableDocument = ConstructorParameters<typeof Readability>[0];

interface Fetched {
  type: string;
  body: Buffer;
}

function allowedUrl(raw: string): URL | null {
  if (!URL.canParse(raw)) return null;
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== "80" && url.port !== "443") return null;
  return url;
}

function decompress(response: IncomingMessage) {
  const encoding = response.headers["content-encoding"]?.trim().toLowerCase();
  if (!encoding || encoding === "identity") return response;
  if (encoding === "br") return response.pipe(zlib.createBrotliDecompress());
  if (["gzip", "x-gzip", "deflate"].includes(encoding)) return response.pipe(zlib.createUnzip());
  response.destroy();
  throw new Error("Unsupported encoding");
}

async function readLimited(response: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of decompress(response)) {
      chunks.push(chunk as Buffer);
      size += (chunk as Buffer).length;
      if (size >= MAX_BYTES) break;
    }
  } finally {
    response.destroy();
  }
  return Buffer.concat(chunks).subarray(0, MAX_BYTES);
}

function requestOnce(url: URL, headers: Record<string, string>, signal: AbortSignal) {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(url, {
      headers: { "user-agent": USER_AGENT, "accept-encoding": "gzip, deflate, br", ...headers },
      agent: useAgent(url.href, { keepAlive: false }),
      signal,
    });
    request.on("response", resolve);
    request.on("error", reject);
    request.end();
  });
}

async function safeGet(
  raw: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<Fetched> {
  let url = allowedUrl(raw);
  for (let hop = 0; url && hop <= MAX_REDIRECTS; hop += 1) {
    const response = await requestOnce(url, headers, signal);
    const status = response.statusCode ?? 0;
    const location = response.headers.location;
    if (status >= 300 && status < 400 && location) {
      response.destroy();
      url = allowedUrl(new URL(location, url).href);
      continue;
    }
    if (status !== 200) {
      response.destroy();
      throw new Error(`Status ${status}`);
    }
    const type = String(response.headers["content-type"] ?? "").toLowerCase();
    return { type, body: await readLimited(response) };
  }
  throw new Error("Blocked or too many redirects");
}

function decode({ type, body }: Fetched) {
  const charset = /charset=["']?([\w-]+)/i.exec(type)?.[1] ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(body);
  } catch {
    return new TextDecoder().decode(body);
  }
}

function fallbackText(html: string) {
  const { document } = parseHTML(html);
  const description = document
    .querySelector('meta[name="description"], meta[property="og:description"]')
    ?.getAttribute("content");
  document.querySelectorAll(NOISE).forEach((node) => node.remove());
  const main = document.querySelector("main") ?? document.body;
  return [document.title, description, main?.textContent].filter(Boolean).join("\n");
}

export function htmlToText(html: string) {
  const { document } = parseHTML(html);
  const article = new Readability(document as unknown as ReadableDocument).parse();
  const text = article?.textContent?.trim();
  if (text && text.length >= TEXT_MIN) return [article?.title, text].filter(Boolean).join("\n");
  return fallbackText(html);
}

function clip(text: string) {
  const clean = text
    .replace(/[^\S\n]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
  return clean.length > TEXT_LIMIT ? `${clean.slice(0, TEXT_LIMIT)}…` : clean;
}

function githubRepo(url: URL) {
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return null;
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repo) return null;
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.replace(/\.git$/, ""))}`;
}

interface GithubRepo {
  full_name?: string;
  description?: string | null;
  homepage?: string | null;
  topics?: string[];
  language?: string | null;
}

async function githubGet(path: string, accept: string, token: string, signal: AbortSignal) {
  const headers = {
    accept: accept,
    "user-agent": USER_AGENT,
    "x-github-api-version": "2022-11-28",
  };
  const url = `https://api.github.com${path}`;
  if (token) {
    const response = await fetch(url, {
      headers: { ...headers, authorization: `Bearer ${token}` },
      signal,
    });
    if (response.ok) return response;
  }
  const response = await fetch(url, { headers, signal });
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response;
}

async function readGithub(base: string, token: string, signal: AbortSignal) {
  const [info, readme] = await Promise.allSettled([
    githubGet(base, "application/vnd.github+json", token, signal).then(
      (response) => response.json() as Promise<GithubRepo>,
    ),
    githubGet(`${base}/readme`, "application/vnd.github.raw+json", token, signal).then((response) =>
      response.text(),
    ),
  ]);
  const parts: string[] = [];
  if (info.status === "fulfilled") {
    const data = info.value;
    parts.push(
      [
        data.full_name,
        data.description,
        data.language ? `Language: ${data.language}` : "",
        data.topics?.length ? `Topics: ${data.topics.join(", ")}` : "",
        data.homepage ? `Homepage: ${data.homepage}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  if (readme.status === "fulfilled") parts.push(readme.value.slice(0, MAX_BYTES));
  return parts.join("\n\n");
}

async function readPage(url: string, signal: AbortSignal) {
  const page = await safeGet(url, { accept: TEXT_TYPES.join(", ") }, signal);
  if (!TEXT_TYPES.some((type) => page.type.startsWith(type))) throw new Error("Unsupported type");
  const text = decode(page);
  return page.type.includes("html") ? htmlToText(text) : text;
}

export type LinkResult =
  { content: LinkContent; failure: null } | { content: null; failure: string };

function failed(failure: string): LinkResult {
  return { content: null, failure };
}

function describeFailure(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const { code } = error as NodeJS.ErrnoException;
  if (code) return code;
  if (error.message.includes(FILTERED_ADDRESS_MESSAGE)) return "address not allowed";
  return error.message;
}

export async function loadLink(
  raw: string,
  githubToken: string,
  parent: AbortSignal,
): Promise<LinkResult> {
  const url = allowedUrl(raw);
  if (!url) return failed("url not allowed");
  const signal = AbortSignal.any([parent, AbortSignal.timeout(TIMEOUT)]);
  try {
    const repo = githubRepo(url);
    const text = clip(
      repo ? await readGithub(repo, githubToken, signal) : await readPage(url.href, signal),
    );
    if (text.length < TEXT_MIN) return failed("too little text");
    return { content: { url: url.href, text }, failure: null };
  } catch (error) {
    if (parent.aborted) throw error;
    return failed(describeFailure(error));
  }
}
