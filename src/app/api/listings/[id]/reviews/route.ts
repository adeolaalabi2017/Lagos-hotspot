import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);

  const listing = await db.listing.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!listing || listing.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = await db.review.findMany({
    where: { listingId: id, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      author: {
        id: r.author.id,
        name: r.author.name,
        avatar: r.author.avatar,
      },
    })),
  });
}
