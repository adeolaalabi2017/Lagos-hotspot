import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAll = mutation({
  args: {
    users: v.array(
      v.object({
        id: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        avatar: v.optional(v.string()),
        phone: v.optional(v.string()),
        bio: v.optional(v.string()),
        role: v.string(),
        passwordHash: v.optional(v.string()),
        suspendedAt: v.optional(v.number()),
        suspendedReason: v.optional(v.string()),
      })
    ),
    listings: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        category: v.string(),
        price: v.optional(v.string()),
        image: v.optional(v.string()),
        rating: v.number(),
        reviewCount: v.number(),
        location: v.optional(v.string()),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        phone: v.optional(v.string()),
        whatsappNumber: v.optional(v.string()),
        instagramHandle: v.optional(v.string()),
        isFeatured: v.boolean(),
        isOpen: v.boolean(),
        isVerified: v.boolean(),
        isTrending: v.boolean(),
        tags: v.optional(v.string()),
        amenities: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        rejectReason: v.optional(v.string()),
        status: v.string(),
        authorId: v.optional(v.string()),
      })
    ),
    listingHours: v.array(
      v.object({
        id: v.string(),
        listingId: v.string(),
        dayOfWeek: v.number(),
        opensAt: v.optional(v.string()),
        closesAt: v.optional(v.string()),
        isClosed: v.boolean(),
      })
    ),
    media: v.array(
      v.object({
        id: v.string(),
        url: v.string(),
        kind: v.string(),
        hotspotId: v.optional(v.string()),
      })
    ),
    reviews: v.array(
      v.object({
        id: v.string(),
        listingId: v.string(),
        userId: v.string(),
        rating: v.number(),
        comment: v.optional(v.string()),
        status: v.string(),
        authorId: v.string(),
        authorName: v.optional(v.string()),
        authorAvatar: v.optional(v.string()),
      })
    ),
    reports: v.array(
      v.object({
        id: v.string(),
        category: v.string(),
        reason: v.optional(v.string()),
        status: v.string(),
        outcome: v.optional(v.string()),
        reporterId: v.optional(v.string()),
        hotspotId: v.optional(v.string()),
        reviewId: v.optional(v.string()),
      })
    ),
    adminActions: v.array(
      v.object({
        id: v.string(),
        actorId: v.string(),
        action: v.string(),
        targetType: v.string(),
        targetId: v.optional(v.string()),
        reason: v.optional(v.string()),
        metadata: v.optional(v.string()),
      })
    ),
    adminImports: v.array(
      v.object({
        id: v.string(),
        actorId: v.string(),
        fileName: v.string(),
        rowCount: v.number(),
        successCount: v.number(),
        failureCount: v.number(),
      })
    ),
    bookings: v.array(
      v.object({
        id: v.string(),
        listingId: v.string(),
        userId: v.string(),
        date: v.string(),
        time: v.optional(v.string()),
        partySize: v.optional(v.number()),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.string(),
        decidedAt: v.optional(v.number()),
        decidedById: v.optional(v.string()),
        decisionNote: v.optional(v.string()),
      })
    ),
    conversationThreads: v.array(
      v.object({
        id: v.string(),
        userId: v.string(),
        listingId: v.string(),
        lastMessageAt: v.number(),
      })
    ),
    conversationMessages: v.array(
      v.object({
        id: v.string(),
        threadId: v.string(),
        senderId: v.string(),
        body: v.string(),
        readAt: v.optional(v.number()),
      })
    ),
    messages: v.array(
      v.object({
        id: v.string(),
        content: v.string(),
        senderId: v.string(),
        receiverId: v.optional(v.string()),
        isRead: v.boolean(),
      })
    ),
    bookmarks: v.array(
      v.object({
        userId: v.string(),
        listingId: v.string(),
      })
    ),
    categories: v.array(
      v.object({
        name: v.string(),
        icon: v.string(),
        count: v.number(),
        color: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: Record<string, number> = {};
    const userMap: Record<string, string> = {};
    const listingMap: Record<string, string> = {};

    // Users
    for (const u of args.users) {
      const { id, ...rest } = u;
      const newId = await ctx.db.insert("users", {
        ...rest,
        passwordHash: "",
        suspendedAt: rest.suspendedAt || undefined,
      });
      userMap[id] = newId;
      results.users = (results.users || 0) + 1;
    }

    // Listings
    for (const l of args.listings) {
      const { id, authorId, ...rest } = l;
      const newId = await ctx.db.insert("listings", {
        ...rest,
        authorId: authorId ? userMap[authorId] : undefined,
      });
      listingMap[id] = newId;
      results.listings = (results.listings || 0) + 1;
    }

    // ListingHours
    for (const h of args.listingHours) {
      const newListingId = listingMap[h.listingId];
      if (!newListingId) continue;
      await ctx.db.insert("listingHours", {
        listingId: newListingId,
        dayOfWeek: h.dayOfWeek,
        opensAt: h.opensAt,
        closesAt: h.closesAt,
        isClosed: h.isClosed,
      });
      results.listingHours = (results.listingHours || 0) + 1;
    }

    // Media
    for (const m of args.media) {
      const newHotspotId = m.hotspotId ? listingMap[m.hotspotId] : undefined;
      await ctx.db.insert("media", {
        url: m.url,
        kind: m.kind,
        hotspotId: newHotspotId,
      });
      results.media = (results.media || 0) + 1;
    }

    // Reviews
    for (const r of args.reviews) {
      const newListingId = listingMap[r.listingId];
      const newUserId = userMap[r.userId];
      if (!newListingId || !newUserId) continue;
      await ctx.db.insert("reviews", {
        listingId: newListingId,
        userId: newUserId,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        authorId: newUserId,
        author: { id: newUserId, name: r.authorName || undefined, avatar: r.authorAvatar || undefined },
      });
      results.reviews = (results.reviews || 0) + 1;
    }

    // Reports
    for (const r of args.reports) {
      await ctx.db.insert("reports", {
        category: r.category,
        reason: r.reason,
        status: r.status,
        outcome: r.outcome,
        reporterId: r.reporterId ? userMap[r.reporterId] : undefined,
        hotspotId: r.hotspotId ? listingMap[r.hotspotId] : undefined,
        reviewId: r.reviewId || undefined,
      });
      results.reports = (results.reports || 0) + 1;
    }

    // AdminActions
    for (const a of args.adminActions) {
      await ctx.db.insert("adminActions", {
        actorId: userMap[a.actorId] || a.actorId,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        reason: a.reason,
        metadata: a.metadata,
      });
      results.adminActions = (results.adminActions || 0) + 1;
    }

    // AdminImports
    for (const a of args.adminImports) {
      await ctx.db.insert("adminImports", {
        actorId: userMap[a.actorId] || a.actorId,
        fileName: a.fileName,
        rowCount: a.rowCount,
        successCount: a.successCount,
        failureCount: a.failureCount,
      });
      results.adminImports = (results.adminImports || 0) + 1;
    }

    // Bookings
    for (const b of args.bookings) {
      const newListingId = listingMap[b.listingId];
      const newUserId = userMap[b.userId];
      if (!newListingId || !newUserId) continue;
      await ctx.db.insert("bookings", {
        listingId: newListingId,
        userId: newUserId,
        date: b.date,
        time: b.time,
        partySize: b.partySize,
        name: b.name,
        phone: b.phone,
        notes: b.notes,
        status: b.status,
        decidedAt: b.decidedAt,
        decidedById: b.decidedById ? userMap[b.decidedById] : undefined,
        decisionNote: b.decisionNote,
      });
      results.bookings = (results.bookings || 0) + 1;
    }

    // ConversationThreads
    for (const t of args.conversationThreads) {
      const newUserId = userMap[t.userId];
      const newListingId = listingMap[t.listingId];
      if (!newUserId || !newListingId) continue;
      await ctx.db.insert("conversationThreads", {
        userId: newUserId,
        listingId: newListingId,
        lastMessageAt: t.lastMessageAt,
      });
      results.conversationThreads = (results.conversationThreads || 0) + 1;
    }

    // ConversationMessages
    for (const m of args.conversationMessages) {
      await ctx.db.insert("conversationMessages", {
        threadId: m.threadId,
        senderId: m.senderId,
        body: m.body,
        readAt: m.readAt,
      });
      results.conversationMessages = (results.conversationMessages || 0) + 1;
    }

    // Messages
    for (const m of args.messages) {
      await ctx.db.insert("messages", {
        content: m.content,
        senderId: m.senderId,
        receiverId: m.receiverId,
        isRead: m.isRead,
      });
      results.messages = (results.messages || 0) + 1;
    }

    // Bookmarks
    for (const b of args.bookmarks) {
      const newUserId = userMap[b.userId];
      const newListingId = listingMap[b.listingId];
      if (!newUserId || !newListingId) continue;
      await ctx.db.insert("bookmarks", {
        userId: newUserId,
        listingId: newListingId,
      });
      results.bookmarks = (results.bookmarks || 0) + 1;
    }

    // Categories
    for (const c of args.categories) {
      await ctx.db.insert("categories", {
        name: c.name,
        icon: c.icon,
        count: c.count,
        color: c.color,
      });
      results.categories = (results.categories || 0) + 1;
    }

    return results;
  },
});
