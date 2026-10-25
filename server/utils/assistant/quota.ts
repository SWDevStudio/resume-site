import { assistantStorage, isFromOtherDay, storageKey, withStorageLock } from "./storage";
import type { Visitor } from "./visitor";

const DAILY_MESSAGES = 5;
const FILTER_REFUSALS_TO_BLOCK = 2;
const SITE_DAILY_ANSWERS = 100;
const STALE_CLEANUP_INTERVAL = 60 * 60 * 1000;

interface StoredCounter {
  count: number;
  streak: number;
  blocked: boolean;
}

interface StoredSiteAnswers {
  count: number;
}

interface Counter {
  messages: number;
  filterRefusalsInRow: number;
  blocked: boolean;
}

interface Counters {
  session: Counter;
  ip: Counter;
}

type CounterChange = (counter: Counter) => Counter;

export interface Quota {
  remaining: number;
  blocked: boolean;
}

let lastStaleCleanup = 0;

async function readCounter(key: string): Promise<Counter> {
  const stored = await assistantStorage().getItem<StoredCounter>(key);
  return {
    messages: stored?.count ?? 0,
    filterRefusalsInRow: stored?.streak ?? 0,
    blocked: stored?.blocked ?? false,
  };
}

function writeCounter(key: string, { messages, filterRefusalsInRow, blocked }: Counter) {
  const stored: StoredCounter = { count: messages, streak: filterRefusalsInRow, blocked };
  return assistantStorage().setItem(key, stored);
}

async function readCounters(visitor: Visitor): Promise<Counters> {
  const [session, ip] = await Promise.all([
    readCounter(visitor.sessionKey),
    readCounter(visitor.ipKey),
  ]);
  return { session, ip };
}

function quotaOf({ session, ip }: Counters): Quota {
  const used = Math.max(session.messages, ip.messages);
  return {
    remaining: Math.max(0, DAILY_MESSAGES - used),
    blocked: session.blocked || ip.blocked,
  };
}

async function saveChange(visitor: Visitor, counters: Counters, change: CounterChange) {
  const next = { session: change(counters.session), ip: change(counters.ip) };
  await Promise.all([
    writeCounter(visitor.sessionKey, next.session),
    writeCounter(visitor.ipKey, next.ip),
  ]);
  return quotaOf(next);
}

function changeCounters(visitor: Visitor, change: CounterChange): Promise<Quota> {
  return withStorageLock(async () => saveChange(visitor, await readCounters(visitor), change));
}

function addMessage(counter: Counter): Counter {
  return { ...counter, messages: counter.messages + 1 };
}

function removeMessage(counter: Counter): Counter {
  return { ...counter, messages: Math.max(0, counter.messages - 1) };
}

function addFilterRefusal(counter: Counter): Counter {
  const filterRefusalsInRow = counter.filterRefusalsInRow + 1;
  const blocked = counter.blocked || filterRefusalsInRow >= FILTER_REFUSALS_TO_BLOCK;
  return { ...counter, filterRefusalsInRow, blocked };
}

function resetFilterRefusals(counter: Counter): Counter {
  return { ...counter, filterRefusalsInRow: 0 };
}

function canSendMessage({ blocked, remaining }: Quota) {
  return !blocked && remaining > 0;
}

export async function readQuota(visitor: Visitor): Promise<Quota> {
  return quotaOf(await readCounters(visitor));
}

export function takeMessage(visitor: Visitor): Promise<Quota | null> {
  return withStorageLock(async () => {
    const counters = await readCounters(visitor);
    if (!canSendMessage(quotaOf(counters))) return null;
    return saveChange(visitor, counters, addMessage);
  });
}

export function refundMessage(visitor: Visitor) {
  return changeCounters(visitor, removeMessage);
}

export function recordFilterRefusal(visitor: Visitor) {
  return changeCounters(visitor, addFilterRefusal);
}

export function recordFilterAcceptance(visitor: Visitor) {
  return changeCounters(visitor, resetFilterRefusals);
}

async function readSiteAnswers(day: string) {
  const stored = await assistantStorage().getItem<StoredSiteAnswers>(storageKey.siteAnswers(day));
  return stored?.count ?? 0;
}

function writeSiteAnswers(day: string, count: number) {
  const stored: StoredSiteAnswers = { count };
  return assistantStorage().setItem(storageKey.siteAnswers(day), stored);
}

export function reserveSiteAnswer(day: string): Promise<boolean> {
  return withStorageLock(async () => {
    const answers = await readSiteAnswers(day);
    if (answers >= SITE_DAILY_ANSWERS) return false;
    await writeSiteAnswers(day, answers + 1);
    return true;
  });
}

export function releaseSiteAnswer(day: string): Promise<void> {
  return withStorageLock(async () => {
    const answers = await readSiteAnswers(day);
    await writeSiteAnswers(day, Math.max(0, answers - 1));
  });
}

export function removeStaleCounters(today: string): Promise<void> {
  const now = Date.now();
  if (now - lastStaleCleanup < STALE_CLEANUP_INTERVAL) return Promise.resolve();
  lastStaleCleanup = now;
  return withStorageLock(async () => {
    const keys = await assistantStorage().getKeys();
    const stale = keys.filter((key) => isFromOtherDay(key, today));
    await Promise.all(stale.map((key) => assistantStorage().removeItem(key)));
  });
}
