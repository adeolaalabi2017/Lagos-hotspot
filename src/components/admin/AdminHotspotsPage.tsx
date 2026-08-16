"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Copy, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HotspotStatus = "draft" | "published" | "archived";

interface AdminHotspot {
  id: string;
  title: string;
  description: string | null;
  category: string;
  area: string | null;
  price: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  instagramHandle: string | null;
  image: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  isTrending: boolean;
  isOpen: boolean;
  tags: string | null;
  amenities: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "pending", label: "Pending" },
  { id: "featured", label: "Featured" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function AdminHotspotsPage() {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "title">("newest");

  const hotspots = useQuery(api.admin.listAll, {
    status: filter === "all" ? undefined : filter === "featured" ? undefined : filter,
    q: search || undefined,
    limit: 100,
  }) as AdminHotspot[] | undefined;

  const updateListing = useMutation(api.admin.updateListing);
  const deleteListing = useMutation(api.admin.deleteListing);

  const filtered = useMemo(() => {
    if (!hotspots) return [];
    let list = hotspots;
    
    if (filter === "featured") {
      list = list.filter((r) => r.isFeatured);
    }
    
    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return list;
  }, [hotspots, filter, sort]);

  const handleApprove = async (id: string) => {
    try {
      await updateListing({ id, status: "published" });
      toast.success("Hotspot approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateListing({ id, status: "draft", rejectReason: "Rejected by admin" });
      toast.success("Hotspot rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateListing({ id, isFeatured: !current });
      toast.success(current ? "Removed from featured" : "Marked as featured");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hotspot permanently?")) return;
    try {
      await deleteListing({ id });
      toast.success("Hotspot deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-listings"
        title="Hotspots"
        description="Review, approve, and manage hotspot listings"
        actions={
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-1" />
            New hotspot
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                filter === f.id
                  ? "rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5"
                  : "rounded-full border bg-card text-muted-foreground text-xs font-medium px-3 py-1.5 hover:text-foreground"
              }
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or area"
                className="pl-9 h-9 w-56"
                aria-label="Search hotspots"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "title")}
              className="h-9 rounded-md border bg-card px-2 text-sm"
              aria-label="Sort hotspots"
            >
              <option value="newest">Newest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </span>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Area</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Flags</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!hotspots ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading hotspots…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No hotspots found.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{row.title}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{row.area ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        row.status === "published" ? "bg-green-100 text-green-700" :
                        row.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                        row.status === "pending" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.isFeatured ? <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Featured</span> : null}
                        {row.isVerified ? <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Verified</span> : null}
                        {row.isTrending ? <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Trending</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {row.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(row.id)} aria-label={`Approve ${row.title}`}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReject(row.id)} aria-label={`Reject ${row.title}`}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(row.id, row.isFeatured)} aria-label={`Toggle featured ${row.title}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} aria-label={`Delete ${row.title}`}>
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
      </AdminLayout>
    </AdminGuard>
  );
}
