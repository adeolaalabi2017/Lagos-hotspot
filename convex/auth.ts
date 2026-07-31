import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-only-pepper-change-me";

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "|" + AUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const signup = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) {
      throw new Error("Email already registered");
    }
    const passwordHash = await hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name || undefined,
      role: "user",
      passwordHash,
    });
    return { userId };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user?.passwordHash) throw new Error("Invalid credentials");
    const passwordHash = await hashPassword(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid credentials");
    }
    if (user.suspendedAt) {
      throw new Error("Account suspended");
    }
    const token = `${user._id}:${user.role}`;
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        avatar: user.avatar ?? null,
        role: user.role,
        suspendedAt: user.suspendedAt ?? null,
      },
      token,
    };
  },
});

export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const [userId] = args.token.split(":");
    if (!userId) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user || user.suspendedAt) return null;
    return {
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      avatar: user.avatar ?? null,
      role: user.role,
      suspendedAt: user.suspendedAt ?? null,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const [userId] = args.token.split(":");
    if (!userId) return;
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
  },
});

export const updateRole = mutation({
  args: { userId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, { role: args.role });
  },
});

export const suspendUser = mutation({
  args: { userId: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      suspendedAt: Date.now(),
      suspendedReason: args.reason,
    });
  },
});

export const reinstateUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      suspendedAt: undefined,
      suspendedReason: undefined,
    });
  },
});

export const listUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map((u) => ({
      id: u._id,
      email: u.email,
      name: u.name ?? null,
      avatar: u.avatar ?? null,
      role: u.role,
      suspendedAt: u.suspendedAt ?? null,
      createdAt: u._creationTime,
    }));
  },
});
