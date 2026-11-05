import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

// Session tokens are random and only their SHA-256 is stored, so a database
// dump does not leak usable sessions. Every function that acts for a user
// takes the token and resolves the user here — never trust a userId argument.

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100_000;
// Only used to verify hashes written before PBKDF2 was introduced.
const LEGACY_PEPPER = process.env.AUTH_SECRET ?? "dev-only-pepper-change-me";

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return toHex(new Uint8Array(bits));
}

/** "pbkdf2$<iterations>$<salt hex>$<hash hex>" */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomHex(16);
  const hash = await pbkdf2(password, fromHex(salt), PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

/** `needsRehash` is true for legacy unsalted SHA-256 hashes. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (stored.startsWith("pbkdf2$")) {
    const [, iter, salt, hash] = stored.split("$");
    const actual = await pbkdf2(password, fromHex(salt), Number(iter));
    return { ok: safeEqual(actual, hash), needsRehash: false };
  }
  const legacy = await sha256Hex(password + "|" + LEGACY_PEPPER);
  const ok = safeEqual(legacy, stored);
  return { ok, needsRehash: ok };
}

/** Creates a session and returns the raw token, which is shown to the client once. */
export async function createSession(
  ctx: MutationCtx,
  userId: Doc<"users">["_id"]
): Promise<string> {
  const token = randomHex(32);
  await ctx.db.insert("sessions", {
    userId,
    token: await sha256Hex(token),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export async function findSession(
  ctx: QueryCtx,
  token: string | undefined
): Promise<Doc<"sessions"> | null> {
  if (!token) return null;
  const hashed = await sha256Hex(token);
  const row = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", hashed))
    .first();
  if (!row || row.expiresAt < Date.now()) return null;
  return row;
}

/** The signed-in, non-suspended user for `token`, or null. */
export async function getUser(
  ctx: QueryCtx,
  token: string | undefined
): Promise<Doc<"users"> | null> {
  const session = await findSession(ctx, token);
  if (!session) return null;
  const user = await ctx.db.get(session.userId);
  if (!user || user.suspendedAt) return null;
  return user;
}

export async function requireUser(
  ctx: QueryCtx,
  token: string | undefined
): Promise<Doc<"users">> {
  const user = await getUser(ctx, token);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireAdmin(
  ctx: QueryCtx,
  token: string | undefined
): Promise<Doc<"users">> {
  const user = await requireUser(ctx, token);
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}

export function publicUser(user: Doc<"users">) {
  return {
    id: user._id,
    email: user.email,
    name: user.name ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
    suspendedAt: user.suspendedAt ?? null,
    bio: user.bio ?? null,
  };
}
