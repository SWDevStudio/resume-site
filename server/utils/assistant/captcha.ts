import { createHmac } from "node:crypto";
import { createChallenge, randomInt, verifySolution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { z } from "zod";
import type { AssistantChallenge } from "./contract";
import { assistantStorage, storageKey, withStorageLock } from "./storage";

const ALGORITHM = "PBKDF2/SHA-256";
const COST = 1_000;
const COUNTER_MIN = 400;
const COUNTER_MAX = 1_200;
const CHALLENGE_TTL = 10 * 60;
const CLEANUP_INTERVAL = CHALLENGE_TTL * 1000;

const captchaSchema = z.object({
  challenge: z.object({
    parameters: z
      .object({
        algorithm: z.literal(ALGORITHM),
        nonce: z.string(),
        salt: z.string(),
        cost: z.number(),
        keyLength: z.number(),
        keyPrefix: z.string(),
        keySignature: z.string(),
        expiresAt: z.number(),
      })
      .passthrough(),
    signature: z.string().regex(/^[0-9a-f]{64}$/u),
  }),
  solution: z.object({
    counter: z.number(),
    derivedKey: z.string(),
  }),
});

interface UsedChallenge {
  expiresAt: number;
}

let lastCleanup = 0;

function deriveSecret(secret: string, purpose: string) {
  return createHmac("sha256", secret).update(`altcha:${purpose}`).digest("hex");
}

function secretsOf(secret: string) {
  return {
    hmacSignatureSecret: deriveSecret(secret, "signature"),
    hmacKeySignatureSecret: deriveSecret(secret, "key"),
  };
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

export async function issueCaptchaChallenge(secret: string): Promise<AssistantChallenge> {
  const { parameters, signature } = await createChallenge({
    algorithm: ALGORITHM,
    cost: COST,
    counter: randomInt(COUNTER_MAX, COUNTER_MIN),
    deriveKey,
    expiresAt: nowSeconds() + CHALLENGE_TTL,
    ...secretsOf(secret),
  });
  const { keySignature, expiresAt } = parameters;
  if (!signature || !keySignature || !expiresAt) throw new Error("captcha: unsigned challenge");
  return { parameters: { ...parameters, keySignature, expiresAt }, signature };
}

function cleanupUsed(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return Promise.resolve();
  lastCleanup = now;
  return withStorageLock(async () => {
    const storage = assistantStorage();
    const keys = await storage.getKeys(storageKey.usedChallenges);
    const entries = await Promise.all(
      keys.map(async (key) => ({ key, value: await storage.getItem<UsedChallenge>(key) })),
    );
    const seconds = nowSeconds();
    const stale = entries.filter(({ value }) => !value || value.expiresAt < seconds);
    await Promise.all(stale.map(({ key }) => storage.removeItem(key)));
  });
}

function markUsed(signature: string, expiresAt: number): Promise<boolean> {
  const key = storageKey.usedChallenge(signature);
  return withStorageLock(async () => {
    const storage = assistantStorage();
    if (await storage.hasItem(key)) return false;
    await storage.setItem(key, { expiresAt } satisfies UsedChallenge);
    return true;
  });
}

export async function verifyCaptcha(payload: unknown, secret: string): Promise<boolean> {
  void cleanupUsed().catch(() => undefined);
  const parsed = captchaSchema.safeParse(payload);
  if (!parsed.success) return false;
  const { challenge, solution } = parsed.data;
  try {
    const result = await verifySolution({ challenge, solution, deriveKey, ...secretsOf(secret) });
    if (!result.verified) return false;
  } catch {
    return false;
  }
  return markUsed(challenge.signature, challenge.parameters.expiresAt);
}
