import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_IDS = 24;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  if (!raw) {
    return NextResponse.json({ counts: {} });
  }
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
    )
  ).slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ counts: {} });
  }

  const rows = await db.bookmark.groupBy({
    by: ["listingId"],
    where: { listingId: { in: ids } },
    _count: { _all: true },
  });

  // Bucket into "has-saves" / "no-saves" so the response doesn't leak
  // exact popularity numbers, just whether other users have saved each spot.
  const counts: Record<string, true> = {};
  for (const row of rows) {
    if (row._count._all > 0) {
      counts[row.listingId] = true;
    }
  }
  return NextResponse.json({ counts });
}
