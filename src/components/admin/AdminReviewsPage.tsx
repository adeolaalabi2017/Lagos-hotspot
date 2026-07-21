"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Check, EyeOff, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string | null } | null;
  listing: {
    id: string;
    title: string;
    category: string;
    location: string | null;
  } | null;
}

const STATUS_FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "hidden", label: "Hidden" },
  { id: "all", label: "All" },
] as const;

type FilterId = (typeof STATUS_FILTERS)[number]["id"];

export function AdminReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("pending");
  const [deleting, setDeleting] = useState<AdminReview | null>(null);

  const headers = useMemo(() => ({}), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { reviews: AdminReview[] };
      setReviews(data.reviews);
    } catch (err) {
      console.error(err);
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter, headers]);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user?.role, load]);

  async function patch(id: string, action: "approved" | "hide") {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      toast.error("Action failed");
      return;
    }
    toast.success(action === "approved" ? "Approved" : "Hidden");
    load();
  }

  async function destroy() {
    if (!deleting) return;
    const id = deleting.id;
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Deleted");
    setDeleting(null);
    load();
  }

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-reviews"
        title="Reviews"
        description="Approve, hide, or delete user-submitted reviews. Hidden reviews stay in the database but stop appearing on the public hotspot page."
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
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Reviewer</th>
                <th className="text-left px-4 py-3 font-medium">Hotspot</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Rating
                </th>
                <th className="text-left px-4 py-3 font-medium">Comment</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Loading reviews…
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nothing here. {filter === "pending" ? "No reviews are waiting for review." : ""}
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      r.status === "hidden"
                        ? "border-t opacity-50 bg-muted/30"
                        : "border-t"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {r.author?.name ?? "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.author?.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {r.listing?.title ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.listing?.location ?? r.listing?.category}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {r.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-md">
                      <p className="line-clamp-2 text-pretty">
                        {r.comment || "(no comment)"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {r.status !== "approved" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => patch(r.id, "approved")}
                            aria-label="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {r.status !== "hidden" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => patch(r.id, "hide")}
                            aria-label="Hide"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(r)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog
          open={deleting !== null}
          onOpenChange={(o) => {
            if (!o) setDeleting(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete review?</DialogTitle>
              <DialogDescription>
                This removes the review permanently. The hotspot&apos;s rating
                will be recomputed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={destroy}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
