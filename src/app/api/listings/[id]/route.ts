import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toPublicHotspotDetail } from "@/lib/public-listing";

export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      hours: true,
      media: { where: { kind: { in: ["image", "gallery"] } } },
    },
  });

  if (!listing || listing.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ hotspot: toPublicHotspotDetail(listing) });
}
