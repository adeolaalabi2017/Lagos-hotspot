import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  listings: defineTable({
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
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"]),
  listingHours: defineTable({
    listingId: v.id("listings"),
    dayOfWeek: v.number(),
    opensAt: v.optional(v.string()),
    closesAt: v.optional(v.string()),
    isClosed: v.boolean(),
  })
    .index("by_listing", ["listingId"]),
  media: defineTable({
    url: v.string(),
    kind: v.string(),
    hotspotId: v.optional(v.id("listings")),
  })
    .index("by_hotspot", ["hotspotId"]),
  reviews: defineTable({
    listingId: v.id("listings"),
    userId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    status: v.string(),
    authorId: v.string(),
    author: v.object({
      id: v.string(),
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
    }),
  })
    .index("by_listing", ["listingId"])
    .index("by_user", ["userId"])
    .index("by_author", ["authorId"]),
  reports: defineTable({
    category: v.string(),
    reason: v.optional(v.string()),
    status: v.string(),
    outcome: v.optional(v.string()),
    reporterId: v.optional(v.string()),
    hotspotId: v.optional(v.id("listings")),
    reviewId: v.optional(v.id("reviews")),
  })
    .index("by_hotspot", ["hotspotId"])
    .index("by_review", ["reviewId"]),
  adminActions: defineTable({
    actorId: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    reason: v.optional(v.string()),
    metadata: v.optional(v.string()),
  })
    .index("by_actor", ["actorId"]),
  adminImports: defineTable({
    actorId: v.string(),
    fileName: v.string(),
    rowCount: v.number(),
    successCount: v.number(),
    failureCount: v.number(),
  }),
  bookings: defineTable({
    listingId: v.id("listings"),
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
    .index("by_listing", ["listingId"])
    .index("by_user", ["userId"]),
  conversationThreads: defineTable({
    userId: v.string(),
    listingId: v.id("listings"),
    lastMessageAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"]),
  conversationMessages: defineTable({
    threadId: v.id("conversationThreads"),
    senderId: v.string(),
    body: v.string(),
    readAt: v.optional(v.number()),
  }).index("by_thread", ["threadId"]),
  messages: defineTable({
    content: v.string(),
    senderId: v.string(),
    receiverId: v.optional(v.string()),
    isRead: v.boolean(),
  }).index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),
  bookmarks: defineTable({
    userId: v.string(),
    listingId: v.id("listings"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_listing", ["userId", "listingId"]),
  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    count: v.number(),
    color: v.string(),
  }).index("by_name", ["name"]),
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),
});
