"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminHotspotForm, type HotspotFormValues } from "./AdminHotspotForm";
import { defaultHours, type HourRow } from "./HoursEditor";

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
  lat: number | null;
  lng: number | null;
  rejectReason: string | null;
  hours: HourRow[];
  createdAt: string;
  updatedAt: string;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "featured", label: "Featured" },
  { id: "verified", label: "Verified" },
  { id: "trending", label: "Trending" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function effectiveStatus(row: AdminHotspot): HotspotStatus {
  const s = (row.status || "").toLowerCase();
  if (s === "draft") return "draft";
  if (s === "archived") return "archived";
  return "published";
}

export function AdminHotspotsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<AdminHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "title">("newest");

  const [editing, setEditing] = useState<AdminHotspot | "new" | null>(null);
  const [archiving, setArchiving] = useState<AdminHotspot | null>(null);

  const headers = useMemo(() => {
    return {} as Record<string, string>;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hotspots", { headers });
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { hotspots: AdminHotspot[] };
      setRows(data.hotspots);
    } catch (err) {
      console.error(err);
      toast.error("Could not load hotspots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      const id = requestAnimationFrame(() => void load());
      return () => cancelAnimationFrame(id);
    }
  }, [user?.role, load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== "all") {
      list = list.filter((r) => {
        if (filter === "published") return effectiveStatus(r) === "published";
        if (filter === "draft") return effectiveStatus(r) === "draft";
        if (filter === "featured") return r.isFeatured;
        if (filter === "verified") return r.isVerified;
        if (filter === "trending") return r.isTrending;
        return true;
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.area ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [rows, filter, search, sort]);

  async function save(values: HotspotFormValues) {
    if (!user) return;
    const isNew = editing === "new";
    const id = isNew ? null : (editing as AdminHotspot).id;
    const url = isNew ? "/api/admin/hotspots" : `/api/admin/hotspots/${id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? "Save failed");
      return;
    }
    toast.success(isNew ? "Hotspot created" : "Changes saved");
    setEditing(null);
    load();
  }

  async function archive(row: AdminHotspot) {
    const res = await fetch(`/api/admin/hotspots/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ status: "archived" }),
    });
    if (!res.ok) {
      toast.error("Could not archive");
      return;
    }
    toast.success(`Archived ${row.title}`);
    setArchiving(null);
    load();
  }

  async function duplicate(row: AdminHotspot) {
    const payload = {
      title: `${row.title} (copy)`,
      description: row.description,
      category: row.category,
      area: row.area,
      price: row.price,
      phone: row.phone,
      whatsappNumber: row.whatsappNumber,
      instagramHandle: row.instagramHandle,
      image: row.image,
      isFeatured: false,
      isVerified: false,
      isTrending: false,
      isOpen: row.isOpen,
      tags: row.tags,
      amenities: row.amenities,
      lat: row.lat,
      lng: row.lng,
      status: "draft",
    };
    const res = await fetch("/api/admin/hotspots", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Could not duplicate");
      return;
    }
    toast.success("Duplicated");
    load();
  }

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-listings"
        title="Hotspots"
        description="Author, edit, and publish the Lagos catalogue. Newly created rows start as Draft — flip to Published when they're ready for the public site."
        actions={
          <Button onClick={() => setEditing("new")}>
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
                  ? "rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 motion-safe:transition-colors"
                  : "rounded-full border bg-card text-muted-foreground text-xs font-medium px-3 py-1.5 hover:text-foreground motion-safe:transition-colors"
              }
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search
                className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
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
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Area
                </th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  Flags
                </th>
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
                    Loading hotspots…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No hotspots match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const status = effectiveStatus(row);
                  return (
                    <tr
                      key={row.id}
                      className="border-t hover:bg-muted/30 motion-safe:transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {row.area ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {row.isFeatured ? <Flag label="Featured" /> : null}
                          {row.isVerified ? <Flag label="Verified" /> : null}
                          {row.isTrending ? <Flag label="Trending" /> : null}
                          {!row.isFeatured && !row.isVerified && !row.isTrending ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(row)}
                            aria-label={`Edit ${row.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicate(row)}
                            aria-label={`Duplicate ${row.title}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiving(row)}
                            aria-label={`Archive ${row.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Showing {filtered.length} of {rows.length} hotspots.
        </p>

        {editing ? (
          <AdminHotspotForm
            open
            onOpenChange={(o) => {
              if (!o) setEditing(null);
            }}
            initialValues={
              editing === "new"
                ? null
                : hotspotToFormValues(editing)
            }
            onSubmit={save}
          />
        ) : null}

        <Dialog
          open={archiving !== null}
          onOpenChange={(o) => {
            if (!o) setArchiving(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive hotspot?</DialogTitle>
              <DialogDescription>
                {archiving
                  ? `“${archiving.title}” will be removed from the public site but kept in the database for the audit log.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setArchiving(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => archiving && archive(archiving)}
              >
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}

function StatusPill({ status }: { status: HotspotStatus }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
        Published
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
      Archived
    </span>
  );
}

function Flag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}

function hotspotToFormValues(row: AdminHotspot): HotspotFormValues {
  const hours: HourRow[] =
    row.hours && row.hours.length > 0
      ? [...row.hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      : defaultHours();
  return {
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    area: row.area ?? "",
    priceLevel: (row.price ?? "") as HotspotFormValues["priceLevel"],
    phone: row.phone ?? "",
    whatsappNumber: row.whatsappNumber ?? "",
    instagramHandle: row.instagramHandle ?? "",
    coverImageUrl: row.image ?? "",
    galleryUrls: [],
    tags: row.tags ?? "",
    status: effectiveStatus(row),
    isFeatured: row.isFeatured,
    isVerified: row.isVerified,
    isTrending: row.isTrending,
    lat: row.lat == null ? "" : String(row.lat),
    lng: row.lng == null ? "" : String(row.lng),
    hours,
  };
}
