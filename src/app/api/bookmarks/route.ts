import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";

function suspendedGuard(suspendedAt: Date | null) {
  if (suspendedAt) {
    return NextResponse.json({ error: "Suspended" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  const rows = await db.bookmark.findMany({
    where: { userId: r.user.id },
    orderBy: { createdAt: "desc" },
    select: { listingId: true },
  });
  return NextResponse.json({ ids: rows.map((row) => row.listingId) });
}

export async function POST(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  const blocked = suspendedGuard(r.user.suspendedAt);
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as { listingId?: string };
    const listingId = (body.listingId ?? "").trim();
    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listingId" },
        { status: 400 }
      );
    }
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    try {
      await db.bookmark.create({
        data: { userId: r.user.id, listingId },
      });
      return NextResponse.json({ bookmarked: true });
    } catch (err) {
      // Unique constraint — already bookmarked
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json({ bookmarked: true, already: true });
      }
      throw err;
    }
  } catch (err) {
    console.error("POST /api/bookmarks error:", err);
    return NextResponse.json(
      { error: "Failed to add bookmark" },
      { status: 500 }
    );
  }
}
