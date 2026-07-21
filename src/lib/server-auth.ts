import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  decodeSession,
  type SessionPayload,
} from "@/lib/session";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  suspendedAt: Date | null;
}

type RequireResult<T> =
  | { ok: true; user: T }
  | { ok: false; response: NextResponse };

function readCookie(request: NextRequest, name: string): string | null {
  const fromCookie = request.cookies.get(name)?.value ?? null;
  if (fromCookie) return fromCookie;
  // Fallback for tests that prefer Authorization headers
  const auth = request.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

async function userFromPayload(
  payload: SessionPayload
): Promise<SessionUser | null> {
  const u = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      suspendedAt: true,
    },
  });
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    suspendedAt: u.suspendedAt,
  };
}

export async function requireUser(
  request: NextRequest
): Promise<RequireResult<SessionUser>> {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }),
    };
  }
  const payload = decodeSession(token);
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      ),
    };
  }
  const user = await userFromPayload(payload);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

export async function requireAdmin(
  request: NextRequest
): Promise<RequireResult<SessionUser>> {
  const r = await requireUser(request);
  if (!r.ok) return r;
  if (r.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Admins only" }, { status: 403 }),
    };
  }
  return r;
}
