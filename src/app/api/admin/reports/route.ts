import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "open";

  const reports = await db.report.findMany({
    where: status === "all" ? undefined : { status },
    orderBy: { createdAt: "desc" },
    include: {
      hotspot: {
        select: { id: true, title: true, status: true },
      },
      review: {
        select: {
          id: true,
          comment: true,
          rating: true,
          status: true,
          listing: { select: { id: true, title: true } },
        },
      },
    },
    take: 200,
  });

  return NextResponse.json({ reports });
}
