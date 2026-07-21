import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  encodeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

export interface AuthUserPublic {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  suspendedAt: Date | null;
}

export function toPublicUser(row: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  suspendedAt: Date | null;
}): AuthUserPublic {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    role: row.role,
    suspendedAt: row.suspendedAt,
  };
}

export function applySession(response: NextResponse, userId: string): NextResponse {
  const token = encodeSession({
    userId,
    issuedAt: Math.floor(Date.now() / 1000),
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearSession(response: NextResponse): NextResponse {
  const cookie = buildSessionCookie(null);
  response.headers.append("Set-Cookie", cookie);
  return response;
}
