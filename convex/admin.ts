import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./lib/auth";
import { logAdminAction } from "./lib/audit";
import { parseCsv } from "./lib/csv";

export const listAll = query({
  args: {
    token: v.string(),
    q: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const allListings = await ctx.db.query("listings").collect();
    
    const filtered = allListings
      .filter((row) => {
        if (args.status && args.status !== "all" && row.status !== args.status) return false;
        if (!args.q) return true;
        const hay = [row.title, row.description, row.category, row.location, row.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(args.q.toLowerCase());
      })
      .slice(0, args.limit ?? 100);
    
    return filtered.map((row: any) => ({
      id: row._id,
      title: row.title,
      description: row.description ?? null,
      category: row.category,
      area: row.location ?? null,
      price: row.price ?? null,
      phone: row.phone ?? null,
      whatsappNumber: row.whatsappNumber ?? null,
      instagramHandle: row.instagramHandle ?? null,
      image: row.image ?? null,
      isFeatured: row.isFeatured,
      isVerified: row.isVerified,
      isTrending: row.isTrending,
      isOpen: row.isOpen,
      tags: row.tags ?? null,
      amenities: row.amenities ?? null,
      status: row.status,
      lat: row.lat ?? null,
      lng: row.lng ?? null,
      rejectReason: row.rejectReason ?? null,
      createdAt: row._creationTime,
      updatedAt: row._creationTime,
    }));
  },
});

export const updateListing = mutation({
  args: {
    token: v.string(),
    id: v.string(),
    status: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    isOpen: v.optional(v.boolean()),
    rejectReason: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    area: v.optional(v.string()),
    priceLevel: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tags: v.optional(v.string()),
    amenities: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const patch: Record<string, any> = {};
    
    if (args.status !== undefined) patch.status = args.status;
    if (args.isFeatured !== undefined) patch.isFeatured = args.isFeatured;
    if (args.isVerified !== undefined) patch.isVerified = args.isVerified;
    if (args.isTrending !== undefined) patch.isTrending = args.isTrending;
    if (args.isOpen !== undefined) patch.isOpen = args.isOpen;
    if (args.rejectReason !== undefined) patch.rejectReason = args.rejectReason;
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.category !== undefined) patch.category = args.category;
    if (args.area !== undefined) patch.location = args.area;
    if (args.priceLevel !== undefined) patch.price = args.priceLevel;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.whatsapp !== undefined) patch.whatsappNumber = args.whatsapp;
    if (args.instagram !== undefined) patch.instagramHandle = args.instagram;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.amenities !== undefined) patch.amenities = args.amenities;
    
    await ctx.db.patch(args.id as any, patch);
    await logAdminAction(ctx, admin._id, "hotspot.update", "hotspot", args.id, {
      reason: args.rejectReason,
      metadata: JSON.stringify(patch),
    });
    return { ok: true };
  },
});

export const deleteListing = mutation({
  args: { token: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    // Delete related records
    const hours = await ctx.db.query("listingHours").collect();
    for (const h of hours) {
      if (h.listingId === args.id) await ctx.db.delete(h._id);
    }
    
    const media = await ctx.db.query("media").collect();
    for (const m of media) {
      if (m.hotspotId === args.id) await ctx.db.delete(m._id);
    }
    
    const listing = await ctx.db.get(args.id as any);
    await ctx.db.delete(args.id as any);
    await logAdminAction(ctx, admin._id, "hotspot.delete", "hotspot", args.id, {
      metadata: (listing as Doc<"listings"> | null)?.title,
    });
    return { ok: true };
  },
});

export const listUsers = query({
  args: { token: v.string(), q: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const users = await ctx.db.query("users").collect();
    
    const filtered = users
      .filter((u) => {
        if (!args.q) return true;
        const hay = [u.email, u.name].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(args.q.toLowerCase());
      })
      .slice(0, args.limit ?? 100);
    
    return filtered.map((u: any) => ({
      id: u._id,
      email: u.email,
      name: u.name ?? null,
      avatar: u.avatar ?? null,
      role: u.role,
      createdAt: u._creationTime,
      suspendedAt: u.suspendedAt ?? null,
      suspendedReason: u.suspendedReason ?? null,
    }));
  },
});

// ---------- Shared helpers ----------

const iso = (ms: number) => new Date(ms).toISOString();

async function getListing(ctx: QueryCtx, id: string) {
  const listingId = ctx.db.normalizeId("listings", id);
  return listingId ? await ctx.db.get(listingId) : null;
}

/** Recomputes a listing's rating and review count from its approved reviews. */
async function recomputeRating(ctx: MutationCtx, listingId: string) {
  const listing = await getListing(ctx, listingId);
  if (!listing) return;
  const approved = (
    await ctx.db
      .query("reviews")
      .withIndex("by_listing", (q) => q.eq("listingId", listingId))
      .collect()
  ).filter((r) => r.status === "approved");
  const avg = approved.length
    ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
    : 0;
  await ctx.db.patch(listing._id, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: approved.length,
  });
}

// ---------- Reviews ----------

const REVIEW_STATUSES = ["pending", "approved", "hidden"] as const;

export const listReviews = query({
  args: { token: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const reviews = (await ctx.db.query("reviews").order("desc").collect()).filter(
      (r) => args.status === "all" || r.status === args.status
    );
    return Promise.all(
      reviews.slice(0, 200).map(async (r) => {
        const listing = await getListing(ctx, r.listingId);
        const authorId = ctx.db.normalizeId("users", r.authorId);
        const author = authorId ? await ctx.db.get(authorId) : null;
        return {
          id: r._id,
          rating: r.rating,
          comment: r.comment ?? null,
          status: r.status,
          createdAt: iso(r._creationTime),
          author: author
            ? { id: author._id, name: author.name ?? null, email: author.email }
            : { id: r.authorId, name: r.author?.name ?? null, email: null },
          listing: listing
            ? {
                id: listing._id,
                title: listing.title,
                category: listing.category,
                location: listing.location ?? null,
              }
            : null,
        };
      })
    );
  },
});

export const setReviewStatus = mutation({
  args: { token: v.string(), id: v.id("reviews"), status: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!(REVIEW_STATUSES as readonly string[]).includes(args.status)) {
      throw new Error("Unknown review status");
    }
    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");
    await ctx.db.patch(review._id, { status: args.status });
    await recomputeRating(ctx, review.listingId);
    await logAdminAction(
      ctx,
      admin._id,
      args.status === "approved" ? "review.approve" : args.status === "hidden" ? "review.hide" : "review.update",
      "review",
      review._id
    );
    return { ok: true };
  },
});

export const deleteReview = mutation({
  args: { token: v.string(), id: v.id("reviews") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");
    await ctx.db.delete(review._id);
    await recomputeRating(ctx, review.listingId);
    await logAdminAction(ctx, admin._id, "review.delete", "review", review._id, {
      metadata: review.comment?.slice(0, 200),
    });
    return { ok: true };
  },
});

// ---------- Reports ----------

export const listReports = query({
  args: { token: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const reports = (await ctx.db.query("reports").order("desc").collect()).filter(
      (r) => args.status === "all" || r.status === args.status
    );
    return Promise.all(
      reports.slice(0, 200).map(async (r) => {
        const hotspot = r.hotspotId ? await getListing(ctx, r.hotspotId) : null;
        const reviewId = r.reviewId ? ctx.db.normalizeId("reviews", r.reviewId) : null;
        const review = reviewId ? await ctx.db.get(reviewId) : null;
        const reviewListing = review ? await getListing(ctx, review.listingId) : null;
        return {
          id: r._id,
          category: r.category,
          reason: r.reason ?? null,
          status: r.status,
          outcome: r.outcome ?? null,
          createdAt: iso(r._creationTime),
          hotspot: hotspot ? { id: hotspot._id, title: hotspot.title, status: hotspot.status } : null,
          review: review
            ? {
                id: review._id,
                comment: review.comment ?? null,
                rating: review.rating,
                status: review.status,
                listing: { id: review.listingId, title: reviewListing?.title ?? "Removed listing" },
              }
            : null,
        };
      })
    );
  },
});

/** "actioned" hides the reported review, or reverts the reported hotspot to draft. */
export const resolveReport = mutation({
  args: {
    token: v.string(),
    id: v.id("reports"),
    outcome: v.union(v.literal("dismissed"), v.literal("actioned")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const report = await ctx.db.get(args.id);
    if (!report) throw new Error("Report not found");
    if (report.status === "resolved") throw new Error("Report is already resolved");
    if (args.outcome === "actioned") {
      const reviewId = report.reviewId ? ctx.db.normalizeId("reviews", report.reviewId) : null;
      const review = reviewId ? await ctx.db.get(reviewId) : null;
      if (review) {
        await ctx.db.patch(review._id, { status: "hidden" });
        await recomputeRating(ctx, review.listingId);
      }
      const hotspot = report.hotspotId ? await getListing(ctx, report.hotspotId) : null;
      if (hotspot) await ctx.db.patch(hotspot._id, { status: "draft" });
    }
    await ctx.db.patch(report._id, { status: "resolved", outcome: args.outcome });
    await logAdminAction(ctx, admin._id, "report.resolve", "report", report._id, {
      metadata: args.outcome,
    });
    return { ok: true };
  },
});

// ---------- Activity log ----------

export const listActivity = query({
  args: {
    token: v.string(),
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const rows = (await ctx.db.query("adminActions").order("desc").collect())
      .filter((r) => !args.action || r.action === args.action)
      .filter((r) => !args.targetType || r.targetType === args.targetType)
      .slice(0, Math.min(args.limit ?? 200, 500));
    const actors = new Map<string, Doc<"users"> | null>();
    for (const r of rows) {
      if (actors.has(r.actorId)) continue;
      const id = ctx.db.normalizeId("users", r.actorId);
      actors.set(r.actorId, id ? await ctx.db.get(id) : null);
    }
    return rows.map((r) => {
      const actor = actors.get(r.actorId);
      return {
        id: r._id,
        action: r.action,
        targetType: r.targetType,
        targetId: r.targetId ?? null,
        reason: r.reason ?? null,
        metadata: r.metadata ?? null,
        createdAt: iso(r._creationTime),
        actor: { id: r.actorId, name: actor?.name ?? null, email: actor?.email ?? null },
      };
    });
  },
});

// ---------- Creating hotspots ----------

const HOTSPOT_CATEGORIES = [
  "Food & Dining",
  "Nightlife",
  "Beaches & Resorts",
  "Culture & Arts",
  "Cafes & Hangouts",
  "Shopping",
  "Events & Entertainment",
  "Wellness & Spa",
];
const LISTING_STATUSES = ["draft", "published", "archived"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const hotspotFields = {
  title: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  area: v.optional(v.string()),
  priceLevel: v.optional(v.string()),
  phone: v.optional(v.string()),
  whatsappNumber: v.optional(v.string()),
  instagramHandle: v.optional(v.string()),
  coverImageUrl: v.optional(v.string()),
  galleryUrls: v.optional(v.array(v.string())),
  tags: v.optional(v.string()),
  status: v.optional(v.string()),
  isFeatured: v.optional(v.boolean()),
  isVerified: v.optional(v.boolean()),
  isTrending: v.optional(v.boolean()),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),
};

type HotspotInput = {
  title: string;
  description?: string;
  category: string;
  area?: string;
  priceLevel?: string;
  phone?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  coverImageUrl?: string;
  tags?: string;
  status?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
  lat?: number;
  lng?: number;
};

/** Field errors for a hotspot, keyed like the CSV headers. Empty when valid. */
function validateHotspot(h: HotspotInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!h.title.trim()) errors.title = "Title is required";
  else if (h.title.length > 120) errors.title = "Title is too long";
  if (!HOTSPOT_CATEGORIES.includes(h.category)) errors.category = "Unknown category";
  if (h.priceLevel && !["1", "2", "3", "4"].includes(h.priceLevel)) {
    errors.priceLevel = "Must be 1–4";
  }
  if (h.status && !LISTING_STATUSES.includes(h.status)) {
    errors.status = "Must be draft, published or archived";
  }
  if (h.lat !== undefined && (!Number.isFinite(h.lat) || h.lat < -90 || h.lat > 90)) {
    errors.lat = "Invalid latitude";
  }
  if (h.lng !== undefined && (!Number.isFinite(h.lng) || h.lng < -180 || h.lng > 180)) {
    errors.lng = "Invalid longitude";
  }
  if (h.coverImageUrl && !/^https?:\/\//i.test(h.coverImageUrl)) {
    errors.coverImageUrl = "Must be an http(s) URL";
  }
  return errors;
}

async function insertHotspot(ctx: MutationCtx, h: HotspotInput, authorId: string) {
  const blank = (s?: string) => (s && s.trim() ? s.trim() : undefined);
  return ctx.db.insert("listings", {
    title: h.title.trim(),
    description: blank(h.description),
    category: h.category,
    price: blank(h.priceLevel),
    image: blank(h.coverImageUrl) ?? "",
    rating: 0,
    reviewCount: 0,
    location: blank(h.area),
    city: "Lagos",
    country: "Nigeria",
    phone: blank(h.phone),
    whatsappNumber: blank(h.whatsappNumber),
    instagramHandle: blank(h.instagramHandle)?.replace(/^@/, ""),
    isFeatured: h.isFeatured ?? false,
    isOpen: true,
    isVerified: h.isVerified ?? false,
    isTrending: h.isTrending ?? false,
    tags: blank(h.tags),
    lat: h.lat,
    lng: h.lng,
    status: h.status || "draft",
    authorId,
  });
}

export const createHotspot = mutation({
  args: {
    token: v.string(),
    ...hotspotFields,
    hours: v.optional(
      v.array(
        v.object({
          dayOfWeek: v.number(),
          opensAt: v.union(v.string(), v.null()),
          closesAt: v.union(v.string(), v.null()),
          isClosed: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const { token: _token, hours, galleryUrls, ...input } = args;
    const errors = validateHotspot(input);
    for (const h of hours ?? []) {
      if (!Number.isInteger(h.dayOfWeek) || h.dayOfWeek < 0 || h.dayOfWeek > 6) {
        errors.hours = "Invalid day";
      } else if (!h.isClosed && (!TIME_RE.test(h.opensAt ?? "") || !TIME_RE.test(h.closesAt ?? ""))) {
        errors.hours = "Opening hours must be HH:MM";
      }
    }
    const first = Object.values(errors)[0];
    if (first) throw new ConvexError(first);

    const listingId = await insertHotspot(ctx, input, admin._id);
    for (const h of hours ?? []) {
      await ctx.db.insert("listingHours", {
        listingId,
        dayOfWeek: h.dayOfWeek,
        opensAt: h.isClosed ? undefined : h.opensAt ?? undefined,
        closesAt: h.isClosed ? undefined : h.closesAt ?? undefined,
        isClosed: h.isClosed,
      });
    }
    for (const url of galleryUrls ?? []) {
      if (/^https?:\/\//i.test(url)) {
        await ctx.db.insert("media", { url, kind: "image", hotspotId: listingId });
      }
    }
    await logAdminAction(ctx, admin._id, "hotspot.create", "hotspot", listingId, {
      metadata: input.title,
    });
    return { id: listingId };
  },
});

/** Public URL for a file an admin just uploaded via brand.generateUploadUrl. */
export const uploadedFileUrl = mutation({
  args: { token: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Upload not found");
    await logAdminAction(ctx, admin._id, "media.uploaded", "media", args.storageId);
    return { url };
  },
});

// ---------- CSV import ----------

const CSV_HEADERS = [
  "title", "description", "category", "area", "priceLevel", "phone",
  "whatsappNumber", "instagramHandle", "status", "isFeatured", "isVerified",
  "isTrending", "lat", "lng", "coverImageUrl", "tags",
];
const MAX_IMPORT_ROWS = 1000;

function parseBool(value: string | undefined): boolean | undefined | "invalid" {
  const s = (value ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return "invalid";
}

function parseNumber(value: string | undefined): number | undefined {
  const s = (value ?? "").trim();
  return s ? Number(s) : undefined;
}

/**
 * Validates every row and imports the valid ones. Status defaults to draft.
 * Returns a per-row preview with errors keyed by column.
 */
export const importCsv = mutation({
  args: { token: v.string(), fileName: v.string(), csv: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    const [header, ...body] = parseCsv(args.csv);
    if (!header) throw new ConvexError("The file is empty");
    const columns = header.map((h) => h.trim());
    const missing = ["title", "category"].filter((h) => !columns.includes(h));
    if (missing.length) throw new ConvexError(`Missing required columns: ${missing.join(", ")}`);
    if (body.length > MAX_IMPORT_ROWS) {
      throw new ConvexError(`Too many rows (max ${MAX_IMPORT_ROWS})`);
    }

    const preview: { rowIndex: number; data: Record<string, string>; errors: Record<string, string> }[] = [];
    let successCount = 0;
    for (const [i, cells] of body.entries()) {
      const data: Record<string, string> = {};
      columns.forEach((col, c) => {
        if (CSV_HEADERS.includes(col)) data[col] = (cells[c] ?? "").trim();
      });
      const flags = {
        isFeatured: parseBool(data.isFeatured),
        isVerified: parseBool(data.isVerified),
        isTrending: parseBool(data.isTrending),
      };
      const input: HotspotInput = {
        ...data,
        title: data.title ?? "",
        category: data.category ?? "",
        status: data.status?.toLowerCase() || undefined,
        lat: parseNumber(data.lat),
        lng: parseNumber(data.lng),
        isFeatured: flags.isFeatured === "invalid" ? undefined : flags.isFeatured,
        isVerified: flags.isVerified === "invalid" ? undefined : flags.isVerified,
        isTrending: flags.isTrending === "invalid" ? undefined : flags.isTrending,
      };
      const errors = validateHotspot(input);
      for (const [key, value] of Object.entries(flags)) {
        if (value === "invalid") errors[key] = "Must be true or false";
      }
      if (Object.keys(errors).length === 0) {
        await insertHotspot(ctx, input, admin._id);
        successCount++;
      }
      preview.push({ rowIndex: i + 2, data, errors });
    }
    const failureCount = preview.length - successCount;
    const importId = await ctx.db.insert("adminImports", {
      actorId: admin._id,
      fileName: args.fileName.slice(0, 200),
      rowCount: preview.length,
      successCount,
      failureCount,
    });
    await logAdminAction(ctx, admin._id, "hotspot.import", "import", importId, {
      metadata: `${args.fileName}: ${successCount} imported, ${failureCount} skipped`,
    });
    return { preview, successCount, failureCount };
  },
});
