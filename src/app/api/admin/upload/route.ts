import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Only jpeg, png, webp allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ulid = crypto.randomBytes(10).toString("hex");
    const ext = extFromMime(file.type);
    const filename = `${ulid}.${ext}`;

    const publicDir = path.join(process.cwd(), "public", "images");
    await mkdir(publicDir, { recursive: true });
    await writeFile(path.join(publicDir, filename), buffer);
    const url = `/images/${filename}`;

    const media = await db.media.create({
      data: {
        url,
        kind: file.type.startsWith("image/") ? "image" : "file",
      },
    });

    await logAdminAction({
      actorId: auth.adminId,
      action: "media.uploaded",
      targetType: "media",
      targetId: media.id,
      metadata: { url, size: file.size },
    });

    return NextResponse.json({ url, mediaId: media.id });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
