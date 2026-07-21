import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";
import { getThreadForUser } from "@/lib/messaging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_BODY = 2000;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;
  const { id: threadId } = await context.params;

  const thread = await getThreadForUser(threadId, r.user.id);
  if (!thread.ok) {
    if (thread.reason === "not-found") {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  const rawLimitParam = request.nextUrl.searchParams.get("limit");
  const rawLimit = rawLimitParam == null ? NaN : Number(rawLimitParam);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const where: {
    threadId: string;
    createdAt?: { lt: Date };
  } = { threadId };
  if (cursor) {
    const d = new Date(cursor);
    if (!Number.isNaN(d.getTime())) {
      where.createdAt = { lt: d };
    }
  }

  const rows = await db.conversationMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      senderId: true,
      body: true,
      createdAt: true,
      readAt: true,
    },
  });

  return NextResponse.json({
    messages: rows
      .map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt ? m.readAt.toISOString() : null,
      }))
      // Return oldest-first so the UI doesn't have to reverse for scroll
      .reverse(),
    nextCursor:
      rows.length === limit
        ? rows[rows.length - 1].createdAt.toISOString()
        : null,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;
  if (r.user.suspendedAt) {
    return NextResponse.json({ error: "Suspended" }, { status: 403 });
  }

  const { id: threadId } = await context.params;
  const thread = await getThreadForUser(threadId, r.user.id);
  if (!thread.ok) {
    if (thread.reason === "not-found") {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { body?: string };
  try {
    body = (await request.json()) as { body?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = (body.body ?? "").trim();
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

  try {
    const message = await db.conversationMessage.create({
      data: {
        threadId: thread.threadId,
        senderId: r.user.id,
        body: text,
      },
    });
    await db.conversationThread.update({
      where: { id: thread.threadId },
      data: { lastMessageAt: message.createdAt },
    });
    return NextResponse.json(
      {
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
  } catch (err) {
    console.error("POST /api/messaging/threads/[id]/messages error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
