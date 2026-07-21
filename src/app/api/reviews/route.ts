import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  if (r.user.suspendedAt) {
    return NextResponse.json(
      { error: "Suspended" },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as {
      listingId?: string;
      rating?: number;
      comment?: string | null;
    };
    const listingId = (body.listingId ?? "").trim();
    const rating = Number(body.rating);
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : null;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    if (comment !== null && comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment is too long (1000 chars max)" },
        { status: 400 }
      );
    }

    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const review = await db.review.create({
      data: {
        listingId,
        authorId: r.user.id,
        rating,
        comment,
        status: "pending",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
