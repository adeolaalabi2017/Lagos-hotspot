"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Search, ShieldOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
  _count: { reviews: number; listings: number };
}

export function AdminUsersPage() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [suspending, setSuspending] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");
  const [actionInFlight, setActionInFlight] = useState(false);

  const headers = useMemo(() => ({}), []);

  const load = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { users: AdminUser[] };
        setUsers(data.users);
      } catch (err) {
        console.error(err);
        toast.error("Could not load users");
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    if (user?.role !== "admin") return;
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [user?.role, search, load]);

  async function suspend() {
    if (!suspending) return;
    if (reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }
    setActionInFlight(true);
    try {
      const res = await fetch(`/api/admin/users/${suspending.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "suspend", reason: reason.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "Suspend failed");
        return;
      }
      toast.success("Suspended");
      setSuspending(null);
      setReason("");
      load(search);
    } finally {
      setActionInFlight(false);
    }
  }

  async function reinstate(target: AdminUser) {
    const res = await fetch(`/api/admin/users/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ action: "reinstate" }),
    });
    if (!res.ok) {
      toast.error("Reinstate failed");
      return;
    }
    toast.success("Reinstated");
    load(search);
  }

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-users"
        title="Users"
        description="Search accounts and suspend bad actors. Suspended users cannot post reviews until reinstated."
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or name"
              className="pl-9 h-9"
              aria-label="Search users"
            />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  Reviews / Listings
                </th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
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
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={
                      u.suspendedAt
                        ? "border-t bg-destructive/5"
                        : "border-t"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={
                          u.role === "admin"
                            ? "rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5"
                            : "rounded-full bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {u._count.reviews} · {u._count.listings}
                    </td>
                    <td className="px-4 py-3">
                      {u.suspendedAt ? (
                        <span className="rounded-full bg-destructive/15 text-destructive text-xs font-medium px-2 py-0.5">
                          Suspended
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5">
                          Active
                        </span>
                      )}
                      {u.suspendedReason ? (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {u.suspendedReason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {u.suspendedAt ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reinstate(u)}
                            aria-label="Reinstate user"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          u.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSuspending(u);
                                setReason("");
                              }}
                              aria-label="Suspend user"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog
          open={suspending !== null}
          onOpenChange={(o) => {
            if (!o) {
              setSuspending(null);
              setReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend user?</DialogTitle>
              <DialogDescription>
                {suspending
                  ? `Add a reason for suspending ${suspending.email}. The user won't be able to post reviews until reinstated. Min 10 chars.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. Repeated harassment of other reviewers."
              aria-label="Suspension reason"
            />
            <p className="text-xs text-muted-foreground">
              {reason.trim().length}/500 characters
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSuspending(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={suspend}
                disabled={actionInFlight || reason.trim().length < 10}
              >
                Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
