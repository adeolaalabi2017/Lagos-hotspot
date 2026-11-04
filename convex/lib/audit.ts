import type { MutationCtx } from "../_generated/server";

// Writes a row to the admin activity log. Action names are "<target>.<verb>",
// matching the filters in AdminActivityLogPage.
export async function logAdminAction(
  ctx: MutationCtx,
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  extra: { reason?: string; metadata?: string } = {}
) {
  await ctx.db.insert("adminActions", {
    actorId,
    action,
    targetType,
    targetId,
    reason: extra.reason,
    metadata: extra.metadata,
  });
}
