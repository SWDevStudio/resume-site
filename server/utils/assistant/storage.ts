import { useStorage } from "nitropack/runtime";

const DATED_KEY = /^\d{4}-\d{2}-\d{2}:/u;
const USED_CHALLENGES = "captcha";

let lastLockedTask: Promise<unknown> = Promise.resolve();

export function assistantStorage() {
  return useStorage("assistant");
}

export function withStorageLock<T>(task: () => Promise<T>): Promise<T> {
  const run = lastLockedTask.then(task, task);
  lastLockedTask = run.catch(() => undefined);
  return run;
}

export const storageKey = {
  session: (day: string, sessionId: string) => `${day}:visitor:${sessionId}`,
  ip: (day: string, ipHash: string) => `${day}:ip:${ipHash}`,
  siteAnswers: (day: string) => `${day}:global`,
  usedChallenges: USED_CHALLENGES,
  usedChallenge: (signature: string) => `${USED_CHALLENGES}:${signature}`,
};

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isFromOtherDay(key: string, today: string) {
  return DATED_KEY.test(key) && !key.startsWith(`${today}:`);
}
