import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "lagos-hotspot_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  userId: string;
  issuedAt: number;
}

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) {
      throw new Error(
        "AUTH_SECRET must be set to a random string of at least 32 characters in production. " +
          "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
      );
    }
    return s;
  }
  // Dev fallback only in non-production.
  if (s && s.length >= 32) return s;
  return "dev-only-insecure-secret-change-me-in-production-please";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string): string {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
    .toString("utf8");
}

function sign(input: string): string {
  return base64UrlEncode(
    createHmac("sha256", getSecret()).update(input).digest("base64")
  );
}

export function encodeSession(payload: SessionPayload): string {
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function decodeSession(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (typeof parsed.userId !== "string") return null;
    if (Date.now() / 1000 - parsed.issuedAt > SESSION_TTL_SECONDS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string | null): string {
  const base = `${SESSION_COOKIE_NAME}=${token ?? ""}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!token) {
    return `${base}; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }
  return `${base}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}
