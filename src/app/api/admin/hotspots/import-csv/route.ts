import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAdminAction, requireAdmin } from "@/lib/admin";

interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: Record<string, string>;
}

const REQUIRED = ["title", "category", "area"] as const;

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" && !inQuotes) {
      lines.push(cur);
      cur = "";
    } else if (ch === "\r") {
      // skip
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0 || lines.length > 0) lines.push(cur);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? "").trim();
    });
    rows.push(obj);
  }
  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function validateRow(
  rowIndex: number,
  data: Record<string, string>
): ParsedRow {
  const errors: Record<string, string> = {};
  for (const f of REQUIRED) {
    if (!data[f] || data[f].trim() === "") {
      errors[f] = "Required";
    }
  }
  if (data.priceLevel && !["1", "2", "3", "4"].includes(data.priceLevel.trim())) {
    errors.priceLevel = "Must be 1, 2, 3, or 4";
  }
  if (data.status && !["draft", "published", "archived"].includes(data.status.trim().toLowerCase())) {
    errors.status = "Must be draft, published, or archived";
  }
  if (data.lat && data.lat.trim() !== "") {
    const n = Number(data.lat);
    if (!Number.isFinite(n)) errors.lat = "Must be a number";
  }
  if (data.lng && data.lng.trim() !== "") {
    const n = Number(data.lng);
    if (!Number.isFinite(n)) errors.lng = "Must be a number";
  }

  return { rowIndex, data, errors };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      fileName?: string;
      csv?: string;
    };
    if (typeof body.csv !== "string" || body.csv.length === 0) {
      return NextResponse.json(
        { error: "csv body is required" },
        { status: 400 }
      );
    }
    const fileName = body.fileName ?? "import.csv";
    const { rows } = parseCsv(body.csv);
    const parsed: ParsedRow[] = rows.map((data, i) => validateRow(i + 1, data));

    const valid = parsed.filter((r) => Object.keys(r.errors).length === 0);
    const invalid = parsed.filter((r) => Object.keys(r.errors).length > 0);

    let created = 0;
    if (valid.length > 0) {
      await db.$transaction(async (tx) => {
        for (const r of valid) {
          await tx.listing.create({
            data: {
              title: r.data.title,
              description: r.data.description || null,
              category: r.data.category,
              location: r.data.area || null,
              city: "Lagos",
              country: "Nigeria",
              price: r.data.priceLevel || null,
              phone: r.data.phone || null,
              whatsappNumber: r.data.whatsappNumber || null,
              instagramHandle: r.data.instagramHandle || null,
              image: r.data.coverimageurl || null,
              isFeatured:
                r.data.isfeatured === "true" ||
                r.data.isfeatured === "1" ||
                r.data.isfeatured === "yes",
              isVerified:
                r.data.isverified === "true" ||
                r.data.isverified === "1" ||
                r.data.isverified === "yes",
              isTrending:
                r.data.istrending === "true" ||
                r.data.istrending === "1" ||
                r.data.istrending === "yes",
              status: r.data.status?.toLowerCase() || "draft",
              lat: r.data.lat ? Number(r.data.lat) : null,
              lng: r.data.lng ? Number(r.data.lng) : null,
              tags: r.data.tags
                ? r.data.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .join(",")
                : null,
              authorId: null,
            },
          });
          created++;
        }
        await tx.adminImport.create({
          data: {
            actorId: auth.adminId,
            fileName,
            rowCount: rows.length,
            successCount: created,
            failureCount: invalid.length,
          },
        });
      });
    } else {
      await db.adminImport.create({
        data: {
          actorId: auth.adminId,
          fileName,
          rowCount: rows.length,
          successCount: 0,
          failureCount: invalid.length,
        },
      });
    }

    await logAdminAction({
      actorId: auth.adminId,
      action: "hotspot.import",
      targetType: "import",
      metadata: {
        fileName,
        successCount: created,
        failureCount: invalid.length,
      },
    });

    if (created > 0) {
      revalidatePath("/explore");
      revalidatePath("/");
    }

    return NextResponse.json({
      preview: parsed,
      successCount: created,
      failureCount: invalid.length,
    });
  } catch (error) {
    console.error("Admin import-csv error:", error);
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 }
    );
  }
}
