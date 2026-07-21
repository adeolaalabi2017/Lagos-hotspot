import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "pending";

  const reviews = await db.review.findMany({
    where: status === "all" ? undefined : { status },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      listing: {
        select: { id: true, title: true, category: true, location: true },
      },
    },
    take: 200,
  });

  return NextResponse.json({ reviews });
}
