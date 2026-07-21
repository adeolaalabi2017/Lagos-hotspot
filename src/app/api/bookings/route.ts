import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";
import { parseBookingInput } from "@/lib/bookings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  const role = (request.nextUrl.searchParams.get("role") ?? "guest").toLowerCase();

  const rawLimitParam = request.nextUrl.searchParams.get("limit");
  const rawLimit = rawLimitParam == null ? NaN : Number(rawLimitParam);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const cursor = request.nextUrl.searchParams.get("cursor");
  const cursorDate = cursor ? new Date(cursor) : null;
  const cursorIsValid =
    cursorDate != null && !Number.isNaN(cursorDate.getTime());

  const baseSelect = {
    id: true,
    listingId: true,
    userId: true,
    date: true,
    time: true,
    partySize: true,
    name: true,
    phone: true,
    notes: true,
    status: true,
    decidedAt: true,
    decidedById: true,
    decisionNote: true,
    createdAt: true,
    updatedAt: true,
    listing: {
      select: {
        id: true,
        title: true,
        image: true,
        category: true,
        city: true,
        authorId: true,
      },
    },
    user: {
      select: { id: true, name: true },
    },
  } as const;

  let bookings;
  if (role === "host") {
    // Listings authored by this user
    const where = {
      listing: { authorId: r.user.id },
      ...(cursorIsValid ? { createdAt: { lt: cursorDate! } } : {}),
    };
    bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        ...baseSelect,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  } else {
    // Default: guest view
    const where = {
      userId: r.user.id,
      ...(cursorIsValid ? { createdAt: { lt: cursorDate! } } : {}),
    };
    bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: baseSelect,
    });
  }

  return NextResponse.json({
    role,
    bookings: bookings.map((b) => ({
      id: b.id,
      listingId: b.listingId,
      listing: b.listing,
      userId: b.userId,
      user: b.user,
      date: b.date,
      time: b.time,
      partySize: b.partySize,
      name: b.name,
      phone: b.phone,
      notes: b.notes,
      status: b.status,
      decidedAt: b.decidedAt ? b.decidedAt.toISOString() : null,
      decidedById: b.decidedById,
      decisionNote: b.decisionNote,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    nextCursor:
      bookings.length === limit
        ? bookings[bookings.length - 1].createdAt.toISOString()
        : null,
  });
}

export async function POST(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  if (r.user.suspendedAt) {
    return NextResponse.json({ error: "Suspended" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseBookingInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const listing = await db.listing.findUnique({
    where: { id: parsed.listingId },
    select: { id: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Double-booking guard
  const duplicate = await db.booking.findFirst({
    where: {
      userId: r.user.id,
      listingId: parsed.listingId,
      date: parsed.dateStr,
      time: parsed.timeStr,
      status: { in: ["pending", "confirmed"] },
    },
    select: { id: true, status: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "Already requested", bookingId: duplicate.id, status: duplicate.status },
      { status: 409 }
    );
  }

  const created = await db.booking.create({
    data: {
      userId: r.user.id,
      listingId: parsed.listingId,
      date: parsed.dateStr,
      time: parsed.timeStr ?? null,
      partySize: parsed.partySize,
      name: parsed.name,
      phone: parsed.phone,
      notes: parsed.notes,
      status: "pending",
    },
  });
  return NextResponse.json(
    {
      booking: {
        id: created.id,
        listingId: created.listingId,
        userId: created.userId,
        date: created.date,
        time: created.time,
        partySize: created.partySize,
        name: created.name,
        phone: created.phone,
        notes: created.notes,
        status: created.status,
        decidedAt: null,
        decidedById: null,
        decisionNote: null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
