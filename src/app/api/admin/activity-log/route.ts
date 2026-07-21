import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const actionFilter = url.searchParams.get("action");
  const targetFilter = url.searchParams.get("targetType");
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? 200),
    500
  );

  const rows = await db.adminAction.findMany({
    where: {
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(targetFilter ? { targetType: targetFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ rows });
}
