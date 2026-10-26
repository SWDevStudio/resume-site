import { createHmac } from "node:crypto";
import type { H3Event } from "h3";
import { getRequestIP, useSession } from "h3";
import { storageKey, utcDay } from "./storage";

const SESSION_COOKIE = "assistant_visitor";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export interface Visitor {
  day: string;
  sessionKey: string;
  ipKey: string;
}

async function sessionIdOf(event: H3Event, secret: string) {
  const session = await useSession(event, {
    name: SESSION_COOKIE,
    password: secret,
    maxAge: SESSION_MAX_AGE,
    sessionHeader: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: !import.meta.dev,
      path: "/api/assistant",
    },
  });
  return session.id!;
}

function hashIp(secret: string, day: string, ip: string) {
  return createHmac("sha256", secret).update(`ip:${day}:${ip}`).digest("base64url");
}

export async function visitorFromRequest(event: H3Event, secret: string): Promise<Visitor> {
  const sessionId = await sessionIdOf(event, secret);
  const day = utcDay();
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  return {
    day,
    sessionKey: storageKey.session(day, sessionId),
    ipKey: storageKey.ip(day, hashIp(secret, day, ip)),
  };
}
