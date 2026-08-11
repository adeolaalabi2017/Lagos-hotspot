import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const result = await requireUser(request);
    if (!result.ok) {
      return NextResponse.json({
        ok: true,
        authenticated: false,
        role: null,
        email: null,
      });
    }
    return NextResponse.json({
      ok: true,
      authenticated: true,
      role: result.user.role,
      email: result.user.email,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      role: null,
      email: null,
    });
  }
}
