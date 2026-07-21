import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { applySession, toPublicUser } from "@/lib/auth-cookie";

const MIN_PASSWORD = 8;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD} characters` },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const created = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
        role: "user",
      },
    });

    const response = NextResponse.json({ user: toPublicUser(created) }, { status: 201 });
    applySession(response, created.id);
    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
