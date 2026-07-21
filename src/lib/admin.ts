import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin as requireAdminCookie } from "@/lib/server-auth";

export async function requireAdmin(
  request: NextRequest
): Promise<
  | { ok: true; adminId: string; adminEmail: string }
  | { ok: false; response: NextResponse }
> {
  const r = await requireAdminCookie(request);
  if (!r.ok) return r;
  return {
    ok: true,
    adminId: r.user.id,
    adminEmail: r.user.email,
  };
}

export async function logAdminAction(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  await db.adminAction.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      reason: input.reason ?? null,
      metadata: input.metadata
        ? JSON.stringify(input.metadata)
        : null,
    },
  });
}
