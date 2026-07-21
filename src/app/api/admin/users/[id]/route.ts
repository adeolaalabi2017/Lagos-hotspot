import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const body = (await request.json()) as {
      action?: string;
      reason?: string;
    };

    if (body.action === "suspend") {
      const reason = (body.reason ?? "").trim();
      if (reason.length < 10 || reason.length > 500) {
        return NextResponse.json(
          { error: "Reason must be between 10 and 500 characters" },
          { status: 400 }
        );
      }
      const user = await db.user.update({
        where: { id },
        data: { suspendedAt: new Date(), suspendedReason: reason },
      });
      await logAdminAction({
        actorId: auth.adminId,
        action: "user.suspend",
        targetType: "user",
        targetId: user.id,
        reason,
      });
      return NextResponse.json({ user });
    }

    if (body.action === "reinstate") {
      const user = await db.user.update({
        where: { id },
        data: { suspendedAt: null, suspendedReason: null },
      });
      await logAdminAction({
        actorId: auth.adminId,
        action: "user.reinstate",
        targetType: "user",
        targetId: user.id,
      });
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
