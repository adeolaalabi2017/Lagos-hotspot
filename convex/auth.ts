import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import {
  createSession,
  findSession,
  getUser,
  hashPassword,
  publicUser,
  requireAdmin,
  requireUser,
  verifyPassword,
} from "./lib/auth";

const ROLES = ["user", "admin"] as const;
const MIN_PASSWORD_LENGTH = 8;

export const signup = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (args.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new Error("Email already registered");
    }
    const userId = await ctx.db.insert("users", {
      email,
      name: args.name || undefined,
      role: "user",
      passwordHash: await hashPassword(args.password),
    });
    const token = await createSession(ctx, userId);
    const user = await ctx.db.get(userId);
    return { userId, user: publicUser(user!), token };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .first();
    if (!user?.passwordHash) throw new Error("Invalid credentials");
    const { ok, needsRehash } = await verifyPassword(args.password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");
    if (user.suspendedAt) {
      throw new Error("Account suspended");
    }
    if (needsRehash) {
      await ctx.db.patch(user._id, { passwordHash: await hashPassword(args.password) });
    }
    const token = await createSession(ctx, user._id);
    return { user: publicUser(user), token };
  },
});

export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.token);
    return user ? publicUser(user) : null;
  },
});

/** Ends only the session that owns `token`. */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await findSession(ctx, args.token);
    if (session) await ctx.db.delete(session._id);
  },
});

export const updateRole = mutation({
  args: { token: v.string(), userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (!(ROLES as readonly string[]).includes(args.role)) {
      throw new Error("Unknown role");
    }
    if (args.userId === admin._id && args.role !== "admin") {
      throw new Error("You cannot remove your own admin role");
    }
    await ctx.db.patch(args.userId, { role: args.role });
    await ctx.db.insert("adminActions", {
      actorId: admin._id,
      action: "user.role",
      targetType: "user",
      targetId: args.userId,
      metadata: args.role,
    });
  },
});

export const suspendUser = mutation({
  args: { token: v.string(), userId: v.id("users"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (args.userId === admin._id) throw new Error("You cannot suspend yourself");
    await ctx.db.patch(args.userId, {
      suspendedAt: Date.now(),
      suspendedReason: args.reason,
    });
    // Sign the user out everywhere.
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of sessions) await ctx.db.delete(session._id);
    await ctx.db.insert("adminActions", {
      actorId: admin._id,
      action: "user.suspend",
      targetType: "user",
      targetId: args.userId,
      reason: args.reason,
    });
  },
});

export const reinstateUser = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.userId, {
      suspendedAt: undefined,
      suspendedReason: undefined,
    });
    await ctx.db.insert("adminActions", {
      actorId: admin._id,
      action: "user.reinstate",
      targetType: "user",
      targetId: args.userId,
    });
  },
});

export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map((u) => ({
      ...publicUser(u),
      createdAt: u._creationTime,
    }));
  },
});

/** The signed-in user edits their own display name and bio. */
export const updateProfile = mutation({
  args: { token: v.string(), name: v.string(), bio: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const name = args.name.trim();
    const bio = args.bio?.trim() ?? "";
    if (!name) throw new ConvexError("Add your name");
    if (name.length > 80) throw new ConvexError("Keep your name under 80 characters");
    if (bio.length > 500) throw new ConvexError("Keep your bio under 500 characters");
    await ctx.db.patch(user._id, { name, bio: bio || undefined });
    return publicUser((await ctx.db.get(user._id))!);
  },
});
