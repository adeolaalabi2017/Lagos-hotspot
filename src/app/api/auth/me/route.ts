import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server-auth";
import { toPublicUser } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return NextResponse.json({ user: null });
  return NextResponse.json({ user: toPublicUser(r.user) });
}
