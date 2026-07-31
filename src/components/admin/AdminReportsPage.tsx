"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Flag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminReport {
  id: string;
  category: string;
  reason: string | null;
  status: string;
  outcome: string | null;
  createdAt: string;
  hotspot: {
    id: string;
    title: string;
    status: string;
  } | null;
  review: {
    id: string;
    comment: string | null;
    rating: number;
    status: string;
    listing: { id: string; title: string };
  } | null;
}

const STATUS_FILTERS = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
] as const;

type FilterId = (typeof STATUS_FILTERS)[number]["id"];

const CATEGORY_LABEL: Record<string, string> = {
  spam: "Spam",
  fake: "Fake / misleading",
  harassment: "Harassment",
  other: "Other",
};

export function AdminReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("open");
  const [resolving, setResolving] = useState<AdminReport | null>(null);
  const [outcome, setOutcome] = useState<"dismissed" | "actioned">(
    "dismissed"
  );
  const [busy, setBusy] = useState(false);

  const headers = useMemo(() => ({}), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { reports: AdminReport[] };
      setReports(data.reports);
    } catch (err) {
      console.error(err);
      toast.error("Could not load reports");
    } finally {
      setLoading(false);
    }
  }, [filter, headers]);

  useEffect(() => {
    if (user?.role === "admin") {
      const id = requestAnimationFrame(() => void load());
      return () => cancelAnimationFrame(id);
    }
  }, [user?.role, load]);

  async function resolve() {
    if (!resolving) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reports/${resolving.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ outcome }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "Could not resolve");
        return;
      }
      toast.success(
        outcome === "actioned"
          ? "Resolved with action — target updated"
          : "Resolved — no action taken"
      );
      setResolving(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  const grouped = useMemo(() => {
    const out: Record<string, AdminReport[]> = {};
    for (const r of reports) {
      const key = r.category || "other";
      if (!out[key]) out[key] = [];
      out[key].push(r);
    }
    return out;
  }, [reports]);

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-reports"
        title="Reports"
        description="Resolve user-submitted reports. Actioned reports hide the linked review or revert the hotspot to Draft."
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                filter === f.id
                  ? "rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 motion-safe:transition-colors"
                  : "rounded-full border bg-card text-muted-foreground text-xs font-medium px-3 py-1.5 hover:text-foreground motion-safe:transition-colors"
              }
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {reports.length} {reports.length === 1 ? "report" : "reports"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Loading reports…
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Nothing here.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {CATEGORY_LABEL[category] ?? category} · {items.length}
                </h3>
                <div className="rounded-lg border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">
                          Target
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Reason
                        </th>
                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                          Status
                        </th>
                        <th className="text-right px-4 py-3 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="px-4 py-3">
                            {r.hotspot ? (
                              <div>
                                <span className="font-medium">
                                  {r.hotspot.title}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  hotspot
                                </span>
                              </div>
                            ) : r.review ? (
                              <div>
                                <span className="font-medium">
                                  {r.review.listing.title}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  review · {r.review.rating.toFixed(1)}★
                                </span>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {r.review.comment ?? "(no comment)"}
                                </p>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs">
                            <p className="line-clamp-2 text-pretty">
                              {r.reason ?? "(no reason provided)"}
                            </p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {r.status === "open" ? (
                              <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
                                Open
                              </span>
                            ) : (
                              <span className="rounded-full bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5">
                                Resolved
                                {r.outcome ? ` · ${r.outcome}` : ""}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.status === "open" ? (
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setResolving(r);
                                    setOutcome("dismissed");
                                  }}
                                  aria-label="Resolve report"
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Check
                                className="h-4 w-4 ml-auto text-emerald-600"
                                aria-hidden
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}

        <Dialog
          open={resolving !== null}
          onOpenChange={(o) => {
            if (!o) setResolving(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve report</DialogTitle>
              <DialogDescription>
                Pick an outcome. &ldquo;Actioned&rdquo; hides the linked review
                or reverts the hotspot to Draft.
              </DialogDescription>
            </DialogHeader>
            <div role="radiogroup" className="flex flex-col gap-2">
              {(
                [
                  ["dismissed", "Dismissed — no action taken"],
                  ["actioned", "Actioned — hide review / revert hotspot"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={outcome === id}
                  onClick={() => setOutcome(id)}
                  className={
                    outcome === id
                      ? "rounded-md border border-primary bg-primary/5 px-4 py-3 text-left text-sm"
                      : "rounded-md border bg-card px-4 py-3 text-left text-sm hover:bg-muted motion-safe:transition-colors"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setResolving(null)}>
                Cancel
              </Button>
              <Button onClick={resolve} disabled={busy}>
                {busy ? "Resolving…" : "Resolve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
