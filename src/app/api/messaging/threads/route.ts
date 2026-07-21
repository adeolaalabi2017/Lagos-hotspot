import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  const threads = await db.conversationThread.findMany({
    where: { userId: r.user.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
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
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          senderId: true,
          body: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
  });

  // Per-thread unread count: messages not by the current user and not yet read.
  const ids = threads.map((t) => t.id);
  const unreadRows =
    ids.length > 0
      ? await db.conversationMessage.groupBy({
          by: ["threadId"],
          where: {
            threadId: { in: ids },
            senderId: { not: r.user.id },
            readAt: null,
          },
          _count: { _all: true },
        })
      : [];
  const unreadMap = new Map<string, number>(
    unreadRows.map((row) => [row.threadId, row._count._all])
  );

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      listingId: t.listingId,
      listing: t.listing,
      lastMessageAt: t.lastMessageAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
      lastMessage: t.messages[0]
        ? {
            id: t.messages[0].id,
            senderId: t.messages[0].senderId,
            body: t.messages[0].body,
            createdAt: t.messages[0].createdAt.toISOString(),
            readAt: t.messages[0].readAt
              ? t.messages[0].readAt.toISOString()
              : null,
          }
        : null,
      unreadCount: unreadMap.get(t.id) ?? 0,
    })),
  });
}
