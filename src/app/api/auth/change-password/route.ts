import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { requireUser } from "@/lib/server-auth";

const MIN_PASSWORD = 8;

export async function POST(request: NextRequest) {
  const r = await requireUser(request);
  if (!r.ok) return r.response;

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const current = body.currentPassword ?? "";
    const next = body.newPassword ?? "";

    if (next.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_PASSWORD} characters` },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: r.user.id },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !verifyPassword(current, user.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    if (current === next) {
      return NextResponse.json(
        { error: "New password must differ from current" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: r.user.id },
      data: { passwordHash: hashPassword(next) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Change-password error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
