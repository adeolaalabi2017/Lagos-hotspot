import { db } from "@/lib/db";

export async function recomputeListingRating(listingId: string): Promise<void> {
  const result = await db.review.aggregate({
    where: { listingId, status: "approved" },
    _avg: { rating: true },
    _count: true,
  });
  await db.listing.update({
    where: { id: listingId },
    data: {
      rating: result._avg.rating ?? 0,
      reviewCount: result._count,
    },
  });
}
