import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { recomputeListingRating } from "@/lib/ratings";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const body = (await request.json()) as { outcome?: string };
    if (body.outcome !== "dismissed" && body.outcome !== "actioned") {
      return NextResponse.json(
        { error: "Outcome must be dismissed or actioned" },
        { status: 400 }
      );
    }

    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id },
        data: {
          status: "resolved",
          outcome: body.outcome!,
        },
      });
      if (body.outcome === "actioned") {
        if (report.reviewId) {
          await tx.review.update({
            where: { id: report.reviewId },
            data: { status: "hidden" },
          });
        }
        if (report.hotspotId) {
          await tx.listing.update({
            where: { id: report.hotspotId },
            data: { status: "draft" },
          });
        }
      }
      return updated;
    });

    if (body.outcome === "actioned" && report.reviewId) {
      const review = await db.review.findUnique({
        where: { id: report.reviewId },
      });
      if (review) await recomputeListingRating(review.listingId);
    }

    await logAdminAction({
      actorId: auth.adminId,
      action: "report.resolve",
      targetType: "report",
      targetId: report.id,
      metadata: {
        outcome: body.outcome,
        hotspotId: report.hotspotId,
        reviewId: report.reviewId,
      },
    });

    return NextResponse.json({ report: result });
  } catch (error) {
    console.error("Admin report PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to resolve report" },
      { status: 500 }
    );
  }
}
