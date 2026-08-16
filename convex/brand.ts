import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBrandAsset = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("brandAssets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (!asset) return null;
    return {
      key: asset.key,
      url: asset.storageId ? await ctx.storage.getUrl(asset.storageId) : null,
      alt: asset.alt,
      updatedAt: asset.updatedAt,
    };
  },
});

export const getAllBrandAssets = query({
  handler: async (ctx) => {
    const assets = await ctx.db.query("brandAssets").collect();
    return Promise.all(
      assets.map(async (asset) => ({
        key: asset.key,
        url: asset.storageId ? await ctx.storage.getUrl(asset.storageId) : null,
        alt: asset.alt,
        updatedAt: asset.updatedAt,
      }))
    );
  },
});

export const setBrandAsset = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    alt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brandAssets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        alt: args.alt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("brandAssets", {
        key: args.key,
        storageId: args.storageId,
        alt: args.alt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: "admin",
      });
    }

    return { ok: true };
  },
});

export const deleteBrandAsset = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brandAssets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing && existing.storageId) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.delete(existing._id);
    }

    return { ok: true };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
