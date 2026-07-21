import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  toPublicHotspot,
  type PublicHotspot,
} from "@/lib/public-listing";
import { isOpenNow } from "@/lib/hours";

export const revalidate = 0;

const MAX_PAGE = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const category = url.searchParams.get("category")?.trim();
  const area = url.searchParams.get("area")?.trim();
  const featured = url.searchParams.get("featured") === "true";
  const trending = url.searchParams.get("trending") === "true";
  const verified = url.searchParams.get("verified") === "true";
  const openNow = url.searchParams.get("openNow") === "true";
  const sort = url.searchParams.get("sort") ?? "newest";
  const priceParam = (url.searchParams.get("price") ?? "").trim();
  const price =
    priceParam && /^[1-4]$/.test(priceParam) ? parseInt(priceParam, 10) : null;

  const listings = await db.listing.findMany({
    where: {
      status: { equals: "published" },
      ...(category ? { category } : {}),
      ...(area ? { location: { equals: area } } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(trending ? { isTrending: true } : {}),
      ...(verified ? { isVerified: true } : {}),
      // sort=trending also narrows to trending rows
      ...(sort === "trending" ? { isTrending: true } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { location: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "rating"
        ? [{ rating: "desc" }, { reviewCount: "desc" }]
        : [{ createdAt: "desc" }],
    take: MAX_PAGE,
    include: {
      hours: true,
      media: { where: { kind: { in: ["image", "gallery"] } } },
    },
  });

  let hotspots: PublicHotspot[] = listings.map((row) =>
    toPublicHotspot(row)
  );

  // Price is not a stored column; filter on the public view.
  if (price !== null) {
    hotspots = hotspots.filter((h) => h.priceLevel === price);
  }

  if (openNow) {
    const now = new Date();
    hotspots = hotspots.filter((h) => {
      const prismaHours = listings
        .find((l) => l.id === h.id)
        ?.hours.map((hr) => ({
          dayOfWeek: hr.dayOfWeek,
          opensAt: hr.opensAt,
          closesAt: hr.closesAt,
          isClosed: hr.isClosed,
        }));
      const state = isOpenNow(prismaHours, true, now);
      return state.state === "open-now";
    });
  }

  return NextResponse.json({
    hotspots,
    nextCursor: hotspots.length === MAX_PAGE ? "more" : null,
  });
}
