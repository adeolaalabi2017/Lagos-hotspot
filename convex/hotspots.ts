import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireUser } from "./lib/auth";
import { parseBookingInput } from "../src/lib/bookings";

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function priceLevelFromString(price: string | null | undefined): 1 | 2 | 3 | 4 | null {
  if (!price) return null;
  const n = Number(price);
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : null;
}

function formatDate(ms: number): string {
  return new Date(ms).toISOString();
}

function toHotspot(row: any, hours: any[], media: any[]) {
  const image = row.image ?? media.find((m) => m.kind === "image")?.url ?? "";
  return {
    id: row._id,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    priceLevel: priceLevelFromString(row.price),
    image,
    rating: row.rating ?? 0,
    reviews: row.reviewCount ?? 0,
    area: row.location ?? "",
    city: row.city ?? "Lagos",
    phone: row.phone ?? "",
    whatsappNumber: row.whatsappNumber ?? "",
    instagramHandle: row.instagramHandle ?? "",
    isFeatured: row.isFeatured,
    isOpen: row.isOpen,
    isTrending: row.isTrending,
    isVerified: row.isVerified,
    isClosed: !row.isOpen,
    tags: splitCsv(row.tags),
    amenities: splitCsv(row.amenities),
    vibeScore: Math.min(
      99,
      Math.max(
        0,
        Math.round(60 + (row.rating ?? 0) * 5 + (row.isTrending ? 5 : 0) + (row.isVerified ? 3 : 0) + Math.min(15, row.reviewCount ?? 0))
      )
    ),
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    gallery: media.filter((m) => m.kind === "image" && m.url !== image).map((m) => m.url),
    hours: hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((h) => ({
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][h.dayOfWeek] ?? `Day ${h.dayOfWeek}`,
      time: h.isClosed ? "Closed" : h.opensAt && h.closesAt ? `${h.opensAt} – ${h.closesAt}` : "Hours unavailable",
    })),
    createdAt: formatDate(row._creationTime),
    updatedAt: formatDate(row._creationTime),
  };
}

async function loadCollections(ctx: any) {
  const listings = await ctx.db.query("listings").collect();
  const hours = await ctx.db.query("listingHours").collect();
  const media = await ctx.db.query("media").collect();
  const reviews = await ctx.db.query("reviews").collect();
  const hoursByListing = new Map<string, any[]>();
  const mediaByListing = new Map<string, any[]>();
  const reviewsByListing = new Map<string, any[]>();
  for (const h of hours) {
    const list = hoursByListing.get(h.listingId) ?? [];
    list.push(h);
    hoursByListing.set(h.listingId, list);
  }
  for (const m of media) {
    const listingId = m.hotspotId;
    if (!listingId) continue;
    const list = mediaByListing.get(listingId) ?? [];
    list.push(m);
    mediaByListing.set(listingId, list);
  }
  for (const r of reviews) {
    const list = reviewsByListing.get(r.listingId) ?? [];
    list.push(r);
    reviewsByListing.set(r.listingId, list);
  }
  return { listings, hoursByListing, mediaByListing, reviewsByListing };
}

function filterAndSort(listings: any[], args: any) {
  const q = (args.q ?? "").trim().toLowerCase();
  return listings
    .filter((row) => (args.status ? row.status === args.status : row.status === "published"))
    .filter((row) => (args.featuredOnly ? row.isFeatured : true))
    .filter((row) => {
      if (!q) return true;
      const hay = [row.title, row.description, row.category, row.location, row.city, row.tags, row.amenities].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    })
    .filter((row) => (args.area && args.area !== "all" ? (row.location ?? "") === args.area : true))
    .filter((row) => (args.category && args.category !== "all" ? row.category === args.category : true))
    .filter((row) => (args.price && args.price !== "all" ? row.price === args.price : true))
    .filter((row) => (args.openNow ? row.isOpen : true))
    .sort((a, b) => {
      switch (args.sort ?? "rating") {
        case "trending":
          return Number(b.isTrending) - Number(a.isTrending) || (b.rating ?? 0) - (a.rating ?? 0);
        case "newest":
          return b._creationTime - a._creationTime;
        default:
          return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      }
    });
}

export const feed = query({
  args: {
    q: v.optional(v.string()),
    area: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.string()),
    openNow: v.optional(v.boolean()),
    sort: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
    trendingOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { listings, hoursByListing, mediaByListing } = await loadCollections(ctx);
    const filtered = filterAndSort(listings, args);
    return filtered.slice(0, args.limit ?? filtered.length).map((row) => toHotspot(row, hoursByListing.get(row._id) ?? [], mediaByListing.get(row._id) ?? []));
  },
});

export const detail = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id as any);
    if (!row) return null;
    const hours = await ctx.db.query("listingHours").filter((q) => q.eq(q.field("listingId"), args.id)).collect();
    const media = await ctx.db.query("media").filter((q) => q.eq(q.field("hotspotId"), args.id)).collect();
    return toHotspot(row, hours, media);
  },
});

export const reviewsByListing = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("reviews").filter((q) => q.eq(q.field("listingId"), args.id)).order("desc").collect();
    // Pending and hidden reviews stay private until an admin approves them.
    return rows.filter((row) => row.status === "approved").map((row: any) => ({
      id: row._id,
      rating: row.rating,
      comment: row.comment ?? null,
      createdAt: formatDate(row._creationTime),
      author: row.author ?? { id: row.authorId, name: null, avatar: null },
    }));
  },
});

export const similar = query({
  args: { id: v.string(), category: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { listings, hoursByListing, mediaByListing } = await loadCollections(ctx);
    const filtered = listings.filter((row: any) => row._id !== args.id && row.category === args.category);
    return filtered.slice(0, args.limit ?? 3).map((row: any) => toHotspot(row, hoursByListing.get(row._id) ?? [], mediaByListing.get(row._id) ?? []));
  },
});

export const submitListing = mutation({
  args: {
    spotName: v.string(),
    category: v.string(),
    area: v.string(),
    description: v.string(),
    priceLevel: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    tags: v.optional(v.string()),
    features: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    await ctx.db.insert("listings", {
      title: args.spotName,
      description: args.description,
      category: args.category,
      price: args.priceLevel,
      image: args.images?.[0] || "",
      images: args.images || [],
      rating: 0,
      reviewCount: 0,
      location: args.area,
      city: "Lagos",
      country: "Nigeria",
      phone: args.phoneNumber,
      whatsappNumber: args.whatsappNumber,
      instagramHandle: args.instagramHandle,
      isFeatured: false,
      isOpen: true,
      isVerified: false,
      isTrending: false,
      tags: args.tags,
      amenities: args.features,
      status: "pending",
      authorId: user._id,
      authorEmail: user.email,
      authorName: user.name,
    });
    return { ok: true };
  },
});

export const submitReview = mutation({
  args: {
    listingId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be 1-5");
    }
    await ctx.db.insert("reviews", {
      listingId: args.listingId,
      rating: args.rating,
      comment: args.comment,
      status: "pending",
      authorId: user._id,
      author: { id: user._id, name: user.name, avatar: user.avatar },
    });
    return { ok: true };
  },
});

export const createBooking = mutation({
  args: {
    token: v.string(),
    listingId: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    partySize: v.optional(v.number()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const listingId = ctx.db.normalizeId("listings", args.listingId);
    if (!listingId || !(await ctx.db.get(listingId))) throw new Error("Listing not found");
    const input = parseBookingInput(args);
    if (!input.ok) throw new Error(input.error);
    await ctx.db.insert("bookings", {
      listingId: args.listingId,
      userId: user._id,
      date: input.dateStr,
      time: input.timeStr ?? undefined,
      partySize: input.partySize,
      name: input.name ?? undefined,
      phone: input.phone ?? undefined,
      notes: input.notes ?? undefined,
      status: "pending",
    });
    return { ok: true };
  },
});

export const search = query({
  args: {
    q: v.string(),
    area: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db.query("listings").collect();
    const q = args.q.toLowerCase();
    
    return listings
      .filter((row) => row.status === "published")
      .filter((row) => {
        const hay = [row.title, row.description, row.category, row.location, row.city, row.tags, row.amenities]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .filter((row) => {
        if (!args.area || args.area === "all") return true;
        return row.location === args.area;
      })
      .filter((row) => {
        if (!args.category || args.category === "all") return true;
        return row.category === args.category;
      })
      .slice(0, 50)
      .map((row: any) => ({
        id: row._id,
        title: row.title,
        description: row.description ?? null,
        category: row.category,
        priceLevel: row.price ? Number(row.price) : null,
        image: row.image ?? null,
        rating: row.rating ?? 0,
        reviews: row.reviewCount ?? 0,
        area: row.location ?? "",
        city: row.city ?? "Lagos",
        phone: row.phone ?? "",
        whatsappNumber: row.whatsappNumber ?? "",
        instagramHandle: row.instagramHandle ?? "",
        isFeatured: row.isFeatured,
        isOpen: row.isOpen,
        isTrending: row.isTrending,
        isVerified: row.isVerified,
        tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
        amenities: row.amenities ? row.amenities.split(",").map((a: string) => a.trim()) : [],
        vibeScore: Math.min(99, Math.max(0, Math.round(60 + (row.rating ?? 0) * 5 + (row.isTrending ? 5 : 0) + (row.isVerified ? 3 : 0) + Math.min(15, row.reviewCount ?? 0)))),
      }));
  },
});

export const startConversation = mutation({
  args: { token: v.string(), listingId: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const body = args.body.trim();
    if (!body) throw new Error("Message is empty");
    if (body.length > 2000) throw new Error("Message is too long");
    const listingId = ctx.db.normalizeId("listings", args.listingId);
    if (!listingId || !(await ctx.db.get(listingId))) throw new Error("Listing not found");
    // One thread per guest and listing.
    const existing = (
      await ctx.db
        .query("conversationThreads")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
    ).find((t) => t.listingId === args.listingId);
    const threadId =
      existing?._id ??
      (await ctx.db.insert("conversationThreads", {
        userId: user._id,
        listingId: args.listingId,
        lastMessageAt: new Date().toISOString(),
      }));
    await ctx.db.insert("conversationMessages", {
      threadId: String(threadId),
      senderId: user._id,
      body,
    });
    if (existing) await ctx.db.patch(existing._id, { lastMessageAt: new Date().toISOString() });
    return { threadId: String(threadId) };
  },
});

const REPORT_CATEGORIES = ["spam", "fake", "harassment", "other"] as const;
const MAX_OPEN_REPORTS_PER_USER = 20;

/**
 * Reports a hotspot or a review for admins to look at (AdminReportsPage).
 * Exactly one of hotspotId and reviewId must be given.
 */
export const submitReport = mutation({
  args: {
    token: v.string(),
    category: v.string(),
    reason: v.optional(v.string()),
    hotspotId: v.optional(v.string()),
    reviewId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    if (!(REPORT_CATEGORIES as readonly string[]).includes(args.category)) {
      throw new ConvexError("Pick a reason for the report");
    }
    if (!!args.hotspotId === !!args.reviewId) {
      throw new ConvexError("Report either a spot or a review");
    }
    const reason = args.reason?.trim() || undefined;
    if (reason && reason.length > 500) {
      throw new ConvexError("Keep the details under 500 characters");
    }

    const listingId = args.hotspotId ? ctx.db.normalizeId("listings", args.hotspotId) : null;
    const reviewId = args.reviewId ? ctx.db.normalizeId("reviews", args.reviewId) : null;
    const target = listingId ? await ctx.db.get(listingId) : reviewId ? await ctx.db.get(reviewId) : null;
    if (!target) throw new ConvexError("That spot or review no longer exists");

    const existing = listingId
      ? await ctx.db
          .query("reports")
          .withIndex("by_hotspot", (q) => q.eq("hotspotId", args.hotspotId))
          .collect()
      : await ctx.db
          .query("reports")
          .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
          .collect();
    if (existing.some((r) => r.reporterId === user._id && r.status === "open")) {
      throw new ConvexError("You've already reported this. We'll take a look.");
    }
    const openByUser = (await ctx.db.query("reports").collect()).filter(
      (r) => r.reporterId === user._id && r.status === "open"
    );
    if (openByUser.length >= MAX_OPEN_REPORTS_PER_USER) {
      throw new ConvexError("You have too many open reports. Please wait for us to review them.");
    }

    await ctx.db.insert("reports", {
      category: args.category,
      reason,
      status: "open",
      reporterId: user._id,
      hotspotId: listingId ? args.hotspotId : undefined,
      reviewId: reviewId ? args.reviewId : undefined,
    });
    return { ok: true };
  },
});
