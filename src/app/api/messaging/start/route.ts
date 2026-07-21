import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";
import { findOrCreateThread } from "@/lib/messaging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_BODY = 2000;

export async function POST(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;
  if (r.user.suspendedAt) {
    return NextResponse.json({ error: "Suspended" }, { status: 403 });
  }

  let body: { listingId?: string; body?: string };
  try {
    body = (await request.json()) as { listingId?: string; body?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const listingId = (body.listingId ?? "").trim();
  const text = (body.body ?? "").trim();

  if (!listingId) {
    return NextResponse.json(
      { error: "listingId is required" },
      { status: 400 }
    );
  }
  if (!text) {
    return NextResponse.json(
      { error: "Message body is required" },
      { status: 400 }
    );
  }
  if (text.length > MAX_BODY) {
    return NextResponse.json(
      { error: `Message is too long (${MAX_BODY} chars max)` },
      { status: 400 }
    );
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const thread = await findOrCreateThread(r.user.id, listingId);
  const message = await db.conversationMessage.create({
    data: {
      threadId: thread.id,
      senderId: r.user.id,
      body: text,
    },
  });
  await db.conversationThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: message.createdAt },
  });
  return NextResponse.json(
    {
      threadId: thread.id,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        readAt: null,
      },
    },
    { status: 201 }
  );
}
