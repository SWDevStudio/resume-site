import type { AssistantCaptcha, AssistantChallenge } from "~/assets/api/types/assistant";

const CHALLENGE_URL = "/api/assistant/challenge";
const SOLVE_TIMEOUT = 60_000;
const EXPIRY_MARGIN = 30;

let prepared: Promise<AssistantCaptcha | null> | null = null;

async function fetchChallenge(): Promise<AssistantChallenge> {
  const response = await fetch(CHALLENGE_URL, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`assistant challenge: ${response.status}`);
  return (await response.json()) as AssistantChallenge;
}

async function solve(): Promise<AssistantCaptcha | null> {
  try {
    const [challenge, { solveChallenge }, { deriveKey }] = await Promise.all([
      fetchChallenge(),
      import("altcha-lib"),
      import("altcha-lib/algorithms/web/pbkdf2"),
    ]);
    const solution = await solveChallenge({ challenge, deriveKey, timeout: SOLVE_TIMEOUT });
    if (!solution) return null;
    return { challenge, solution: { counter: solution.counter, derivedKey: solution.derivedKey } };
  } catch {
    return null;
  }
}

function isFresh(captcha: AssistantCaptcha | null): captcha is AssistantCaptcha {
  if (!captcha) return false;
  return captcha.challenge.parameters.expiresAt - EXPIRY_MARGIN > Date.now() / 1000;
}

export function prepareCaptcha() {
  prepared ??= solve();
}

export async function takeCaptcha(): Promise<AssistantCaptcha | null> {
  const solving = prepared ?? solve();
  prepared = null;
  const captcha = await solving;
  return isFresh(captcha) ? captcha : solve();
}
