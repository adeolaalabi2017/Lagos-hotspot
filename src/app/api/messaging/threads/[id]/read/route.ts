import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";
import { getThreadForUser } from "@/lib/messaging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
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

  const now = new Date();
  const result = await db.conversationMessage.updateMany({
    where: {
      threadId: thread.threadId,
      senderId: { not: r.user.id },
      readAt: null,
    },
    data: { readAt: now },
  });
  return NextResponse.json({ ok: true, marked: result.count });
}
