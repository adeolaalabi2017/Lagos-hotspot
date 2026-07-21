"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Activity } from "lucide-react";

interface AdminActionRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  reason: string | null;
  metadata: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string | null };
}

const ACTION_OPTIONS = [
  { id: "", label: "All actions" },
  { id: "hotspot.create", label: "Hotspot created" },
  { id: "hotspot.update", label: "Hotspot updated" },
  { id: "hotspot.archive", label: "Hotspot archived" },
  { id: "hotspot.import", label: "CSV import" },
  { id: "media.uploaded", label: "Media uploaded" },
  { id: "review.approve", label: "Review approved" },
  { id: "review.hide", label: "Review hidden" },
  { id: "review.delete", label: "Review deleted" },
  { id: "user.suspend", label: "User suspended" },
  { id: "user.reinstate", label: "User reinstated" },
  { id: "report.resolve", label: "Report resolved" },
];

const TARGET_OPTIONS = [
  { id: "", label: "All targets" },
  { id: "hotspot", label: "Hotspot" },
  { id: "review", label: "Review" },
  { id: "user", label: "User" },
  { id: "report", label: "Report" },
  { id: "media", label: "Media" },
  { id: "import", label: "Import" },
];

export function AdminActivityLogPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<AdminActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");

  const headers = useMemo(() => ({}), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      if (targetType) params.set("targetType", targetType);
      params.set("limit", "200");
      const res = await fetch(`/api/admin/activity-log?${params.toString()}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { rows: AdminActionRow[] };
      setRows(data.rows);
    } catch (err) {
      console.error(err);
      toast.error("Could not load activity log");
    } finally {
      setLoading(false);
    }
  }, [action, targetType, headers]);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user?.role, load]);

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-activity-log"
        title="Activity log"
        description="The 200 most-recent admin actions, newest first. Use the filters to drill into a specific action type or target."
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <label className="text-xs text-muted-foreground">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="h-9 rounded-md border bg-card px-2 text-sm"
            aria-label="Filter by action"
          >
            {ACTION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="text-xs text-muted-foreground">Target</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="h-9 rounded-md border bg-card px-2 text-sm"
            aria-label="Filter by target"
          >
            {TARGET_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground ml-auto">
            {rows.length} {rows.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">When</th>
                <th className="text-left px-4 py-3 font-medium">Actor</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Target</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No admin actions match.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {row.actor.name ?? row.actor.email ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.actor.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5">
                        <Activity className="h-3 w-3" />
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.targetType}
                      {row.targetId ? (
                        <span className="ml-1 text-xs font-mono opacity-60">
                          · {row.targetId.slice(-6)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs max-w-md">
                      <p className="line-clamp-2 text-pretty">
                        {row.reason ?? "—"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
