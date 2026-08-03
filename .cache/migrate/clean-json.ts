import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = ".cache/migrate";
const files = readdirSync(base).filter((f) => f.endsWith(".json"));

const schemaFields = {
  users: new Set([
    "email",
    "name",
    "avatar",
    "phone",
    "bio",
    "role",
    "passwordHash",
    "suspendedAt",
    "suspendedReason",
  ]),
  listings: new Set([
    "title",
    "description",
    "category",
    "price",
    "image",
    "rating",
    "reviewCount",
    "location",
    "city",
    "country",
    "phone",
    "whatsappNumber",
    "instagramHandle",
    "isFeatured",
    "isOpen",
    "isVerified",
    "isTrending",
    "tags",
    "amenities",
    "lat",
    "lng",
    "rejectReason",
    "status",
    "authorId",
    "authorEmail",
    "authorName",
  ]),
  listingHours: new Set(["listingId", "dayOfWeek", "opensAt", "closesAt", "isClosed"]),
  media: new Set(["url", "kind", "hotspotId"]),
  reviews: new Set(["listingId", "rating", "comment", "status", "authorId", "authorName", "authorAvatar"]),
  reports: new Set(["category", "reason", "status", "outcome", "reporterId", "hotspotId", "reviewId"]),
  adminActions: new Set(["actorId", "action", "targetType", "targetId", "reason", "metadata"]),
  adminImports: new Set(["actorId", "fileName", "rowCount", "successCount", "failureCount"]),
  bookings: new Set([
    "listingId",
    "userId",
    "date",
    "time",
    "partySize",
    "name",
    "phone",
    "notes",
    "status",
    "decidedAt",
    "decidedById",
    "decisionNote",
  ]),
  conversationThreads: new Set(["userId", "listingId", "lastMessageAt"]),
  conversationMessages: new Set(["threadId", "senderId", "body", "readAt"]),
  messages: new Set(["content", "senderId", "receiverId", "isRead"]),
  bookmarks: new Set(["userId", "listingId"]),
  categories: new Set(["name", "icon", "count", "color"]),
};

function cleanNulls(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(cleanNulls);
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null) continue;
      out[k] = cleanNulls(v);
    }
    return out;
  }
  return obj;
}

function normalize(obj: unknown, allowed: Set<string>): unknown {
  const cleaned = cleanNulls(obj);
  if (Array.isArray(cleaned)) return cleaned.map((item) => normalize(item, allowed));
  if (cleaned && typeof cleaned === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cleaned as Record<string, unknown>)) {
      if (!allowed.has(k)) continue;
      out[k] = v;
    }
    return out;
  }
  return cleaned;
}

for (const file of files) {
  const table = file.replace(".json", "");
  const filePath = join(base, file);
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  const allowed = schemaFields[table as keyof typeof schemaFields] ?? new Set();
  writeFileSync(filePath, JSON.stringify(normalize(data, allowed)));
  console.log(`NORMALIZED ${file}`);
}
