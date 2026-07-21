import { db } from "@/lib/db";

export async function getThreadForUser(
  threadId: string,
  userId: string
): Promise<
  | { ok: true; threadId: string; listingId: string; userId: string }
  | { ok: false; reason: "not-found" | "forbidden" }
> {
  const thread = await db.conversationThread.findUnique({
    where: { id: threadId },
    select: { id: true, userId: true, listingId: true },
  });
  if (!thread) return { ok: false, reason: "not-found" };
  if (thread.userId !== userId) return { ok: false, reason: "forbidden" };
  return {
    ok: true,
    threadId: thread.id,
    listingId: thread.listingId,
    userId: thread.userId,
  };
}

export async function findOrCreateThread(
  userId: string,
  listingId: string
): Promise<{ id: string; listingId: string; userId: string }> {
  // Try to reuse the existing thread first
  const existing = await db.conversationThread.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { id: true, userId: true, listingId: true },
  });
  if (existing) return existing;
  return (
    await db.conversationThread.create({
      data: { userId, listingId },
      select: { id: true, userId: true, listingId: true },
    })
  );
}

export function formatMessageTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
