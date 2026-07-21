import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
      suspendedAt: true,
      suspendedReason: true,
      _count: { select: { reviews: true, listings: true } },
    },
  });

  return NextResponse.json({ users });
}
