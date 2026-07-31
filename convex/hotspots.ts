import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db
    .query("hotspots")
    .order("desc")
    .take(50);
});

export const get = query(async (ctx, args) => {
  const { id } = args as { id: string };
  return await ctx.db.get(id as any);
});
