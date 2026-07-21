"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarPlus,
  Check,
  X,
  Trash2,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";

interface Listing {
  id: string;
  title: string;
  image: string | null;
  category: string;
  city: string | null;
  authorId: string | null;
}

interface BookingUser {
  id: string;
  name: string;
  email?: string;
}

interface Booking {
  id: string;
  listingId: string;
  listing: Listing;
  userId: string;
  user: BookingUser;
  date: string;
  time: string | null;
  partySize: number | null;
  name: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  decidedAt: string | null;
  decidedById: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-700",
  completed: "bg-blue-100 text-blue-800",
};

function fmt(d: string, t: string | null): string {
  // date is YYYY-MM-DD; format as Mon, 14 Jul 2026
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  const dateStr = dt.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return t ? `${dateStr} · ${t}` : dateStr;
}

function initialsOf(v: string): string {
  return (
    v
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function DashboardReservations() {
  const { navigate } = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tab, setTab] = useState<"guest" | "host">("guest");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (role: "guest" | "host") => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings?role=${role}`, {
          credentials: "same-origin",
        });
        if (!res.ok) {
          setError("Could not load reservations");
          return;
        }
        const data = (await res.json()) as { bookings?: Booking[] };
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch {
        setError("Could not load reservations");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    void load(tab);
  }, [tab, isAuthenticated, load]);

  async function decide(
    id: string,
    action: "confirm" | "decline" | "cancel",
    note?: string
  ) {
    setMutating(id);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ action, note }),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? `Could not ${action}`);
        return;
      }
      const data = (await res.json()) as { booking: Booking };
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? data.booking : b))
      );
      toast.success(
        action === "confirm"
          ? "Confirmed"
          : action === "decline"
            ? "Declined"
            : "Cancelled"
      );
    } catch {
      toast.error(`Could not ${action}`);
    } finally {
      setMutating(null);
    }
  }

  async function remove(id: string) {
    setMutating(id);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(id)}`,
        { method: "DELETE", credentials: "same-origin" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "Could not cancel");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Reservation cancelled");
    } catch {
      toast.error("Could not cancel");
    } finally {
      setMutating(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="font-semibold text-foreground mb-1">
            Sign in to see your reservations
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your bookings and host decisions in one place.
          </p>
          <Button onClick={() => navigate("login")}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  const isHostView = tab === "host";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isHostView
              ? "Booking requests for your listings."
              : "Bookings you have requested."}
          </p>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "guest" | "host")}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="guest">My bookings</TabsTrigger>
          <TabsTrigger value="host">Host decisions</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading…
              </CardContent>
            </Card>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">
                  {isHostView ? "No pending bookings" : "No reservations yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isHostView
                    ? "When guests reserve a listing of yours, you'll see it here."
                    : "Find a hotspot you'd like to reserve and request a date."}
                </p>
                {!isHostView && (
                  <Button onClick={() => navigate("explore")}>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Find a spot
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <button
                        className="text-left shrink-0"
                        onClick={() =>
                          navigate("hotspot", { hotspotId: b.listingId })
                        }
                      >
                        <Avatar className="h-14 w-14 rounded-md">
                          {b.listing.image ? (
                            <AvatarImage
                              src={b.listing.image}
                              alt={b.listing.title}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold rounded-md">
                            {initialsOf(b.listing.title)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {b.listing.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {fmt(b.date, b.time)} · party of {b.partySize ?? "?"}
                            </p>
                          </div>
                          <Badge
                            className={`shrink-0 ${STATUS_STYLES[b.status] ?? "bg-gray-100"}`}
                          >
                            {b.status}
                          </Badge>
                        </div>

                        {isHostView && b.user.email ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            Guest: {b.user.name} · {b.user.email}
                          </p>
                        ) : null}

                        {b.notes ? (
                          <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                            “{b.notes}”
                          </p>
                        ) : null}

                        {b.status === "declined" && b.decisionNote ? (
                          <p className="text-xs text-muted-foreground mt-2">
                            Host note: {b.decisionNote}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 justify-end">
                      {b.status === "pending" && isHostView && b.listing.authorId === user?.id && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => decide(b.id, "confirm")}
                            disabled={mutating === b.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => decide(b.id, "decline")}
                            disabled={mutating === b.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {b.status === "pending" && !isHostView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(b.id)}
                          disabled={mutating === b.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
