"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { toast } from "sonner";
import { Search, ShieldOff, ShieldCheck, UserCog } from "lucide-react";
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

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: number;
  suspendedAt: number | null;
  suspendedReason: string | null;
}

export function AdminUsersPage() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [suspending, setSuspending] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");
  const [actionInFlight, setActionInFlight] = useState(false);

  const users = useQuery(api.admin.listUsers, {
    q: search || undefined,
    limit: 100,
  }) as AdminUser[] | undefined;

  const suspendUser = useMutation(api.auth.suspendUser);
  const reinstateUser = useMutation(api.auth.reinstateUser);
  const updateRole = useMutation(api.auth.updateRole);

  const handleSuspend = async () => {
    if (!suspending) return;
    if (reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }
    setActionInFlight(true);
    try {
      await suspendUser({ userId: suspending.id, reason });
      toast.success("User suspended");
      setSuspending(null);
      setReason("");
    } catch {
      toast.error("Failed to suspend user");
    } finally {
      setActionInFlight(false);
    }
  };

  const handleReinstate = async (u: AdminUser) => {
    try {
      await reinstateUser({ userId: u.id });
      toast.success("User reinstated");
    } catch {
      toast.error("Failed to reinstate");
    }
  };

  const handleRoleChange = async (u: AdminUser, newRole: "user" | "admin") => {
    try {
      await updateRole({ userId: u.id, role: newRole });
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to change role");
    }
  };

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-users"
        title="Users"
        description="Search, suspend, and manage user accounts"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name"
              className="pl-9 h-9 w-72"
              aria-label="Search users"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!users ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading users…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{u.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u.suspendedAt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleChange(u, u.role === "admin" ? "user" : "admin")}
                          aria-label={`Toggle role for ${u.email}`}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        {u.suspendedAt ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReinstate(u)}
                            aria-label={`Reinstate ${u.email}`}
                          >
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuspending(u)}
                            aria-label={`Suspend ${u.email}`}
                          >
                            <ShieldOff className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={!!suspending} onOpenChange={(open) => !open && setSuspending(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                This will prevent the user from signing in. Provide a reason (min 10 characters).
              </DialogDescription>
            </DialogHeader>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for suspension..."
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspending(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleSuspend} disabled={actionInFlight}>
                {actionInFlight ? "Suspending..." : "Suspend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
