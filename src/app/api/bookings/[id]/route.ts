import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Action = "confirm" | "decline" | "cancel";

function isAction(value: unknown): value is Action {
  return value === "confirm" || value === "decline" || value === "cancel";
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;
  const { id } = await context.params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { listing: { select: { authorId: true } } },
  });
  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const b = body as { action?: unknown; note?: unknown };
  if (!isAction(b.action)) {
    return NextResponse.json(
      { error: "Unknown action", allowed: ["confirm", "decline", "cancel"] },
      { status: 400 }
    );
  }
  const note =
    typeof b.note === "string" && b.note.trim().length > 0
      ? b.note.trim().slice(0, 1000)
      : null;

  const isGuest = booking.userId === r.user.id;
  const isHost = booking.listing.authorId === r.user.id;

  let nextStatus: "pending" | "confirmed" | "declined" | "cancelled";
  let decisionFields: {
    decidedAt?: Date;
    decidedById?: string;
    decisionNote?: string | null;
  } = {};

  if (b.action === "cancel") {
    if (!isGuest) {
      return NextResponse.json(
        { error: "Cannot cancel another guest's booking" },
        { status: 403 }
      );
    }
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot cancel a ${booking.status} booking` },
        { status: 409 }
      );
    }
    nextStatus = "cancelled";
  } else {
    if (!isHost) {
      return NextResponse.json(
        { error: "Only the host can confirm or decline" },
        { status: 403 }
      );
    }
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 409 }
      );
    }
    nextStatus = b.action === "confirm" ? "confirmed" : "declined";
    decisionFields = {
      decidedAt: new Date(),
      decidedById: r.user.id,
      decisionNote: note,
    };
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: {
      status: nextStatus,
      ...decisionFields,
    },
  });

  return NextResponse.json({
    booking: {
      id: updated.id,
      listingId: updated.listingId,
      userId: updated.userId,
      date: updated.date,
      time: updated.time,
      partySize: updated.partySize,
      name: updated.name,
      phone: updated.phone,
      notes: updated.notes,
      status: updated.status,
      decidedAt: updated.decidedAt ? updated.decidedAt.toISOString() : null,
      decidedById: updated.decidedById,
      decisionNote: updated.decisionNote,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;
  const { id } = await context.params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { listing: { select: { authorId: true } } },
  });
  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const isGuest = booking.userId === r.user.id;
  const isHost = booking.listing.authorId === r.user.id;
  if (!isGuest && !isHost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.booking.delete({ where: { id: booking.id } });
  return NextResponse.json({ ok: true });
}
