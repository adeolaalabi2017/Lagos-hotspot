import { NextRequest, NextResponse } from "next/server";
import { convexFetch } from "@/lib/convex-http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  try {
    const result = await convexFetch<{ url?: string }>("brand:getBrandAsset", { key });
    if (!result?.url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.redirect(result.url);
  } catch (error) {
    console.error("Brand asset fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
