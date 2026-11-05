import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";

// Bookmarks, bookings and messaging for the signed-in user. Every function
// takes the session token and checks that the caller owns (or hosts) the
// records it touches. A listing's host is its `authorId`.

function iso(ms: number | undefined | null): string | null {
  return ms == null ? null : new Date(ms).toISOString();
}

async function getListing(ctx: QueryCtx, id: string) {
  const listingId = ctx.db.normalizeId("listings", id);
  return listingId ? await ctx.db.get(listingId) : null;
}

function listingSummary(id: string, listing: Doc<"listings"> | null) {
  return {
    id,
    title: listing?.title ?? "Removed listing",
    image: listing?.image || null,
    category: listing?.category ?? "",
    city: listing?.city ?? null,
    authorId: listing?.authorId ?? null,
  };
}

/** Ids of listings the user hosts. */
async function hostedListingIds(ctx: QueryCtx, userId: string) {
  const listings = await ctx.db.query("listings").collect();
  return new Set(listings.filter((l) => l.authorId === userId).map((l) => String(l._id)));
}

// ---------- Bookmarks ----------

export const createBookmark = mutation({
  args: { token: v.string(), listingId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    if (!(await getListing(ctx, args.listingId))) throw new Error("Listing not found");
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId)
      )
      .first();
    if (!existing) {
      await ctx.db.insert("bookmarks", { userId: user._id, listingId: args.listingId });
    }
    return { ok: true };
  },
});

export const deleteBookmark = mutation({
  args: { token: v.string(), listingId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", user._id).eq("listingId", args.listingId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { ok: true };
  },
});

export const listBookmarks = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return bookmarks.map((b) => b.listingId);
  },
});

// ---------- Bookings ----------

async function bookingView(ctx: QueryCtx, b: Doc<"bookings">, includeEmail: boolean) {
  const listing = await getListing(ctx, b.listingId);
  const guestId = ctx.db.normalizeId("users", b.userId);
  const guest = guestId ? await ctx.db.get(guestId) : null;
  return {
    id: b._id,
    listingId: b.listingId,
    listing: listingSummary(b.listingId, listing),
    userId: b.userId,
    user: {
      id: b.userId,
      name: guest?.name ?? b.name ?? "Guest",
      ...(includeEmail && guest ? { email: guest.email } : {}),
    },
    date: b.date,
    time: b.time ?? null,
    partySize: b.partySize ?? null,
    name: b.name ?? null,
    phone: b.phone ?? null,
    notes: b.notes ?? null,
    status: b.status,
    decidedAt: b.decidedAt ?? null,
    decidedById: b.decidedById ?? null,
    decisionNote: b.decisionNote ?? null,
    createdAt: iso(b._creationTime)!,
    updatedAt: b.decidedAt ?? iso(b._creationTime)!,
  };
}

/** "guest": bookings the user made. "host": bookings for listings the user hosts. */
export const listBookings = query({
  args: { token: v.string(), role: v.union(v.literal("guest"), v.literal("host")) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    let rows: Doc<"bookings">[];
    if (args.role === "guest") {
      rows = await ctx.db
        .query("bookings")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    } else {
      const hosted = await hostedListingIds(ctx, user._id);
      rows = (await ctx.db.query("bookings").collect()).filter((b) => hosted.has(b.listingId));
    }
    rows.sort((a, b) => b._creationTime - a._creationTime);
    return Promise.all(rows.map((b) => bookingView(ctx, b, args.role === "host")));
  },
});

/**
 * Hosts confirm or decline a pending booking; guests or hosts cancel one.
 * Returns the updated booking.
 */
export const decideBooking = mutation({
  args: {
    token: v.string(),
    bookingId: v.string(),
    action: v.union(v.literal("confirm"), v.literal("decline"), v.literal("cancel")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const bookingId = ctx.db.normalizeId("bookings", args.bookingId);
    const booking = bookingId ? await ctx.db.get(bookingId) : null;
    if (!booking) throw new Error("Booking not found");
    const listing = await getListing(ctx, booking.listingId);
    const isHost = !!listing && listing.authorId === user._id;
    const isGuest = booking.userId === user._id;

    if (args.action === "cancel" ? !isHost && !isGuest : !isHost) {
      throw new Error("You can't change this booking");
    }
    if (booking.status !== "pending") {
      throw new Error(`Booking is already ${booking.status}`);
    }
    const status =
      args.action === "confirm" ? "confirmed" : args.action === "decline" ? "declined" : "cancelled";
    await ctx.db.patch(booking._id, {
      status,
      decisionNote: args.note?.slice(0, 500),
      decidedAt: new Date().toISOString(),
      decidedById: user._id,
    });
    return bookingView(ctx, (await ctx.db.get(booking._id))!, isHost);
  },
});

// ---------- Messaging ----------

async function requireThread(ctx: QueryCtx, threadId: string, userId: string) {
  const id = ctx.db.normalizeId("conversationThreads", threadId);
  const thread = id ? await ctx.db.get(id) : null;
  if (!thread) throw new Error("Conversation not found");
  const listing = await getListing(ctx, thread.listingId);
  if (thread.userId !== userId && listing?.authorId !== userId) {
    throw new Error("Conversation not found");
  }
  return { thread, listing };
}

function messageView(m: Doc<"conversationMessages">) {
  return {
    id: m._id,
    senderId: m.senderId,
    body: m.body,
    createdAt: iso(m._creationTime)!,
    readAt: iso(m.readAt),
  };
}

/** Threads the user started, plus threads about listings they host. */
export const listThreads = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const hosted = await hostedListingIds(ctx, user._id);
    const threads = (await ctx.db.query("conversationThreads").collect()).filter(
      (t) => t.userId === user._id || hosted.has(t.listingId)
    );
    const views = await Promise.all(
      threads.map(async (t) => {
        const messages = await ctx.db
          .query("conversationMessages")
          .withIndex("by_thread", (q) => q.eq("threadId", String(t._id)))
          .collect();
        const last = messages[messages.length - 1];
        return {
          id: t._id,
          listingId: t.listingId,
          listing: listingSummary(t.listingId, await getListing(ctx, t.listingId)),
          lastMessageAt: t.lastMessageAt,
          createdAt: iso(t._creationTime)!,
          lastMessage: last ? messageView(last) : null,
          unreadCount: messages.filter((m) => m.senderId !== user._id && !m.readAt).length,
        };
      })
    );
    return views.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },
});

export const listMessages = query({
  args: { token: v.string(), threadId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const { thread } = await requireThread(ctx, args.threadId, user._id);
    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", String(thread._id)))
      .collect();
    return messages.map(messageView);
  },
});

export const sendMessage = mutation({
  args: { token: v.string(), threadId: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const { thread } = await requireThread(ctx, args.threadId, user._id);
    const body = args.body.trim();
    if (!body) throw new Error("Message is empty");
    if (body.length > 2000) throw new Error("Message is too long");
    const id = await ctx.db.insert("conversationMessages", {
      threadId: String(thread._id),
      senderId: user._id,
      body,
    });
    const message = (await ctx.db.get(id))!;
    await ctx.db.patch(thread._id, { lastMessageAt: iso(message._creationTime)! });
    return messageView(message);
  },
});

export const markRead = mutation({
  args: { token: v.string(), threadId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const { thread } = await requireThread(ctx, args.threadId, user._id);
    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", String(thread._id)))
      .collect();
    for (const msg of messages) {
      if (msg.senderId !== user._id && !msg.readAt) {
        await ctx.db.patch(msg._id, { readAt: Date.now() });
      }
    }
    return { ok: true };
  },
});

// ---------- The signed-in user's own content ----------

/** Spots the user submitted, newest first, with their review status. */
export const mySpots = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const listings = (await ctx.db.query("listings").collect())
      .filter((l) => l.authorId === user._id)
      .sort((a, b) => b._creationTime - a._creationTime);
    return listings.map((l) => ({
      id: l._id,
      title: l.title,
      category: l.category,
      area: l.location ?? null,
      image: l.image || null,
      status: l.status,
      rejectReason: l.rejectReason ?? null,
      rating: l.rating,
      reviewCount: l.reviewCount,
      createdAt: iso(l._creationTime)!,
    }));
  },
});

/** Reviews the user wrote, newest first, including pending and hidden ones. */
export const myReviews = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .order("desc")
      .collect();
    return Promise.all(
      reviews.map(async (r) => ({
        id: r._id,
        listingId: r.listingId,
        listingTitle: (await getListing(ctx, r.listingId))?.title ?? null,
        rating: r.rating,
        comment: r.comment ?? null,
        status: r.status,
        createdAt: iso(r._creationTime)!,
      }))
    );
  },
});
