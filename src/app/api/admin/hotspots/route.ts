import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";

const ALLOWED_STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumberOrNull(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

function asHours(value: unknown): Array<{
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}> | null {
  if (!Array.isArray(value)) return null;
  const result: Array<{
    dayOfWeek: number;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
  }> = [];
  for (const row of value) {
    if (typeof row !== "object" || row === null) continue;
    const r = row as Record<string, unknown>;
    const d = Number(r.dayOfWeek);
    if (!Number.isInteger(d) || d < 0 || d > 6) continue;
    const opens = typeof r.opensAt === "string" && r.opensAt !== "" ? r.opensAt : null;
    const closes = typeof r.closesAt === "string" && r.closesAt !== "" ? r.closesAt : null;
    const isClosed = asBool(r.isClosed);
    result.push({
      dayOfWeek: d,
      opensAt: isClosed ? null : opens,
      closesAt: isClosed ? null : closes,
      isClosed,
    });
  }
  return result;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const hotspots = await db.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { hours: true },
    take: 500,
  });
  return NextResponse.json({ hotspots });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = asString(body.title);
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const status: Status = (ALLOWED_STATUSES as readonly string[]).includes(
      String(body.status ?? "")
    )
      ? (body.status as Status)
      : "draft";

    const tags = asString(body.tags);
    const tagsCsv = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",")
      : null;

    const hotspot = await db.listing.create({
      data: {
        title,
        description: asString(body.description) || null,
        category: asString(body.category) || "Uncategorised",
        location: asString(body.area) || null,
        city: "Lagos",
        country: "Nigeria",
        price: asString(body.priceLevel) || null,
        phone: asString(body.phone) || null,
        whatsappNumber: asString(body.whatsappNumber) || null,
        instagramHandle: asString(body.instagramHandle) || null,
        image: asString(body.coverImageUrl) || null,
        isFeatured: asBool(body.isFeatured),
        isVerified: asBool(body.isVerified),
        isTrending: asBool(body.isTrending),
        isOpen: body.isOpen === false ? false : true,
        tags: tagsCsv,
        lat: asNumberOrNull(body.lat),
        lng: asNumberOrNull(body.lng),
        status,
        authorId: null,
      },
    });

    const hours = asHours(body.hours);
    if (hours && hours.length > 0) {
      await db.listingHour.createMany({
        data: hours.map((h) => ({
          listingId: hotspot.id,
          dayOfWeek: h.dayOfWeek,
          opensAt: h.opensAt,
          closesAt: h.closesAt,
          isClosed: h.isClosed,
        })),
      });
    }

    await logAdminAction({
      actorId: auth.adminId,
      action: "hotspot.create",
      targetType: "hotspot",
      targetId: hotspot.id,
      metadata: { status },
    });

    if (hotspot.status === "published") {
      revalidatePath("/explore");
      revalidatePath("/");
    }

    return NextResponse.json({ hotspot }, { status: 201 });
  } catch (error) {
    console.error("Admin hotspot create error:", error);
    return NextResponse.json(
      { error: "Failed to create hotspot" },
      { status: 500 }
    );
  }
}
