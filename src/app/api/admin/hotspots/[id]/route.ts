import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";

const ALLOWED_STATUSES = ["draft", "published", "archived"] as const;

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function asNumberOrUndef(value: unknown): number | undefined | null {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true" || value === "on" || value === "1") return true;
    if (value === "false" || value === "off" || value === "0") return false;
  }
  return undefined;
}

function asHours(value: unknown): Array<{
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}> | null {
  if (!Array.isArray(value)) return null;
  const out: Array<{
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
    const isClosed = r.isClosed === true || r.isClosed === "true";
    out.push({
      dayOfWeek: d,
      opensAt: isClosed ? null : opens,
      closesAt: isClosed ? null : closes,
      isClosed,
    });
  }
  return out;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const data: Record<string, unknown> = {};

    const title = asString(body.title);
    if (title !== undefined) data.title = title;

    const description = asString(body.description);
    if (description !== undefined) data.description = description;

    const category = asString(body.category);
    if (category !== undefined) data.category = category;

    const area = asString(body.area);
    if (area !== undefined) data.location = area;

    const price = asString(body.priceLevel);
    if (price !== undefined) data.price = price;

    const phone = asString(body.phone);
    if (phone !== undefined) data.phone = phone;

    const whatsapp = asString(body.whatsappNumber);
    if (whatsapp !== undefined) data.whatsappNumber = whatsapp;

    const instagram = asString(body.instagramHandle);
    if (instagram !== undefined) data.instagramHandle = instagram;

    const cover = asString(body.coverImageUrl);
    if (cover !== undefined) data.image = cover;

    const featured = asBool(body.isFeatured);
    if (featured !== undefined) data.isFeatured = featured;

    const verified = asBool(body.isVerified);
    if (verified !== undefined) data.isVerified = verified;

    const trending = asBool(body.isTrending);
    if (trending !== undefined) data.isTrending = trending;

    const open = asBool(body.isOpen);
    if (open !== undefined) data.isOpen = open;

    if (typeof body.status === "string") {
      const s = body.status;
      if ((ALLOWED_STATUSES as readonly string[]).includes(s)) {
        data.status = s;
      }
    }

    const lat = asNumberOrUndef(body.lat);
    if (lat !== undefined) data.lat = lat;
    const lng = asNumberOrUndef(body.lng);
    if (lng !== undefined) data.lng = lng;

    if (typeof body.tags === "string") {
      const tagsCsv = body.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",");
      data.tags = tagsCsv || null;
    }

    const hours = asHours(body.hours);
    const hotspot = await db.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id },
        data,
      });
      if (hours) {
        await tx.listingHour.deleteMany({ where: { listingId: id } });
        if (hours.length > 0) {
          await tx.listingHour.createMany({
            data: hours.map((h) => ({
              listingId: id,
              dayOfWeek: h.dayOfWeek,
              opensAt: h.opensAt,
              closesAt: h.closesAt,
              isClosed: h.isClosed,
            })),
          });
        }
      }
      return updated;
    });

    await logAdminAction({
      actorId: auth.adminId,
      action: "hotspot.update",
      targetType: "hotspot",
      targetId: hotspot.id,
      metadata: data,
    });

    if (hotspot.status === "published" || data.status === "published") {
      revalidatePath("/explore");
      revalidatePath("/");
    }

    return NextResponse.json({ hotspot });
  } catch (error) {
    console.error("Admin hotspot update error:", error);
    return NextResponse.json(
      { error: "Failed to update hotspot" },
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
    const hotspot = await db.listing.update({
      where: { id },
      data: { status: "archived" },
    });
    await logAdminAction({
      actorId: auth.adminId,
      action: "hotspot.archive",
      targetType: "hotspot",
      targetId: hotspot.id,
    });
    return NextResponse.json({ hotspot });
  } catch (error) {
    console.error("Admin hotspot archive error:", error);
    return NextResponse.json(
      { error: "Failed to archive hotspot" },
      { status: 500 }
    );
  }
}
