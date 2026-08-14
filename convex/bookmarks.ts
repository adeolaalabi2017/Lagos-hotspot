import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBookmark = mutation({
  args: { listingId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", userId).eq("listingId", args.listingId)
      )
      .first();
    if (!existing) {
      await ctx.db.insert("bookmarks", { userId, listingId: args.listingId });
    }
    return { ok: true };
  },
});

export const deleteBookmark = mutation({
  args: { listingId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", userId).eq("listingId", args.listingId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { ok: true };
  },
});

export const listBookmarks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return bookmarks.map((b) => b.listingId);
  },
});

export const createBooking = mutation({
  args: {
    listingId: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    partySize: v.optional(v.number()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    await ctx.db.insert("bookings", {
      listingId: args.listingId,
      userId,
      date: args.date,
      time: args.time,
      partySize: args.partySize,
      name: args.name,
      phone: args.phone,
      notes: args.notes,
      status: "pending",
    });
    return { ok: true };
  },
});

export const listBookings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return bookings.map((b) => ({
      id: b._id,
      listingId: b.listingId,
      date: b.date,
      time: b.time,
      partySize: b.partySize,
      name: b.name,
      phone: b.phone,
      notes: b.notes,
      status: b.status,
      decidedAt: b.decidedAt,
      decidedById: b.decidedById,
      decisionNote: b.decisionNote,
      createdAt: b._creationTime,
    }));
  },
});

export const updateBooking = mutation({
  args: {
    bookingId: v.string(),
    status: v.string(),
    decisionNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(args.bookingId as any, {
      status: args.status,
      decisionNote: args.decisionNote,
      decidedAt: new Date().toISOString(),
      decidedById: identity.subject,
    });
    return { ok: true };
  },
});

export const listThreads = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const threads = await ctx.db
      .query("conversationThreads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return threads.map((t) => ({
      id: t._id,
      userId: t.userId,
      listingId: t.listingId,
      lastMessageAt: t.lastMessageAt,
    }));
  },
});

export const listMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    return messages.map((m) => ({
      id: m._id,
      threadId: m.threadId,
      senderId: m.senderId,
      body: m.body,
      readAt: m.readAt,
    }));
  },
});

export const sendMessage = mutation({
  args: { threadId: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.insert("conversationMessages", {
      threadId: args.threadId,
      senderId: identity.subject,
      body: args.body,
    });
    await ctx.db.patch(args.threadId as any, {
      lastMessageAt: new Date().toISOString(),
    });
    return { ok: true };
  },
});

export const markRead = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    for (const msg of messages) {
      if (msg.senderId !== identity.subject && !msg.readAt) {
        await ctx.db.patch(msg._id, { readAt: Date.now() });
      }
    }
    return { ok: true };
  },
});
