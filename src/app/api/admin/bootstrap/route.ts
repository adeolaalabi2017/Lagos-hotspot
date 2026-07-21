import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface BootstrapBody {
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  let body: BootstrapBody;
  try {
    body = (await request.json()) as BootstrapBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = (body.email ?? "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  const user = await db.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: {
      email,
      name: body.name?.trim() || email.split("@")[0],
      role: "admin",
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}
