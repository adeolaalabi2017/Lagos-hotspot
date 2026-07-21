import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { recomputeListingRating } from "@/lib/ratings";

const NEXT_STATUS: Record<string, "approved" | "hidden"> = {
  approved: "approved",
  hide: "hidden",
  hidden: "hidden",
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const body = (await request.json()) as { action?: string };
    const target = NEXT_STATUS[body.action ?? ""];
    if (!target) {
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
    }
    const review = await db.review.update({
      where: { id },
      data: { status: target },
    });
    await recomputeListingRating(review.listingId);
    await logAdminAction({
      actorId: auth.adminId,
      action: target === "approved" ? "review.approve" : "review.hide",
      targetType: "review",
      targetId: review.id,
      metadata: { listingId: review.listingId },
    });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const review = await db.review.delete({ where: { id } });
    await recomputeListingRating(review.listingId);
    await logAdminAction({
      actorId: auth.adminId,
      action: "review.delete",
      targetType: "review",
      targetId: review.id,
      metadata: { listingId: review.listingId },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
