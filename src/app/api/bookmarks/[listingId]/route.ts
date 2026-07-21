import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  if (r.user.suspendedAt) {
    return NextResponse.json({ error: "Suspended" }, { status: 403 });
  }

  const { listingId } = await context.params;
  if (!listingId) {
    return NextResponse.json(
      { error: "Missing listingId" },
      { status: 400 }
    );
  }

  try {
    const result = await db.bookmark.deleteMany({
      where: { userId: r.user.id, listingId },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ bookmarked: false });
  } catch (err) {
    console.error("DELETE /api/bookmarks error:", err);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
