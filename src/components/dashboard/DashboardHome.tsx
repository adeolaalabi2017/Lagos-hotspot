"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { useBookmarkStore } from "@/lib/bookmark-store";
import type { PublicHotspot } from "@/lib/public-listing";
import { convex } from "@/components/convex-provider";
import { api } from "@/lib/convex-api";
import { SpotPhoto } from "@/components/listings/SpotPhoto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Compass,
  Flame,
  MapPin,
  MessageCircle,
  PlusCircle,
  Star,
} from "lucide-react";

// Shapes returned by convex/bookmarks.ts (listBookings / listThreads).
interface Booking {
  id: string;
  listingId: string;
  listing: { title: string };
  date: string;
  time: string | null;
  partySize: number | null;
  status: string;
}

interface Thread {
  id: string;
  listing: { title: string };
  lastMessageAt: string;
  lastMessage: { body: string } | null;
  unreadCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-muted text-muted-foreground",
  completed: "bg-blue-100 text-blue-800",
};

function formatBookingDate(date: string, time: string | null): string {
  const [y, m, d] = date.split("-").map(Number);
  const label = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return time ? `${label} · ${time}` : label;
}

function formatRelative(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function DashboardHome() {
  const { navigate } = useRouter();
  const { user, token } = useAuthStore();
  const { bookmarkedIds } = useBookmarkStore();
  const maxSaves = TIER_FEATURES[user?.tier || "explorer"].maxSavedSpots;

  const bookings = useQuery(
    api.bookmarks.listBookings,
    token ? { token, role: "guest" } : "skip"
  ) as Booking[] | undefined;
  const threads = useQuery(api.bookmarks.listThreads, token ? { token } : "skip") as
    | Thread[]
    | undefined;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings ?? [])
    .filter((b) => b.date >= today && (b.status === "pending" || b.status === "confirmed"))
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  const unread = (threads ?? []).reduce((sum, t) => sum + t.unreadCount, 0);

  // Recommendations: spots in the categories of saved spots, else trending ones.
  const [recommended, setRecommended] = useState<PublicHotspot[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await Promise.all(
        bookmarkedIds.slice(0, 8).map((id) =>
          (convex.query(api.hotspots.detail, { id }) as Promise<PublicHotspot | null>).catch(
            () => null
          )
        )
      );
      const category = saved.find((h) => h?.category)?.category;
      const spots = (await convex
        .query(api.hotspots.feed, category ? { category, sort: "rating" } : { sort: "trending" })
        .catch(() => null)) as PublicHotspot[] | null;
      if (cancelled) return;
      setRecommended((spots ?? []).filter((h) => !bookmarkedIds.includes(h.id)).slice(0, 3));
    })();
    return () => {
      cancelled = true;
    };
  }, [bookmarkedIds]);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  const stats = [
    {
      label: "Saved spots",
      value: bookmarkedIds.length,
      detail: `of ${maxSaves}`,
      icon: Bookmark,
      route: "dashboard-saved" as const,
    },
    {
      label: "Upcoming reservations",
      value: bookings === undefined ? null : upcoming.length,
      detail: null,
      icon: CalendarDays,
      route: "dashboard-reservations" as const,
    },
    {
      label: "Conversations",
      value: threads === undefined ? null : threads.length,
      detail: unread > 0 ? `${unread} unread` : null,
      icon: MessageCircle,
      route: "dashboard-messages" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your saved spots, reservations and messages in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.route)}
            className="text-left rounded-xl border bg-card p-5 hover:shadow-md motion-safe:transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground tabular-nums">
              {stat.value ?? "—"}
              {stat.detail && (
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  {stat.detail}
                </span>
              )}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming reservations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming reservations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("dashboard-reservations")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {bookings === undefined ? (
              <p className="py-6 text-sm text-muted-foreground">Loading…</p>
            ) : upcoming.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No reservations coming up. Find a spot and reserve a table.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate("explore")}>
                  Explore spots
                </Button>
              </div>
            ) : (
              upcoming.slice(0, 3).map((b, i) => (
                <div key={b.id}>
                  <button
                    onClick={() => navigate("hotspot", { id: b.listingId })}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {b.listing.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatBookingDate(b.date, b.time)}
                        {b.partySize ? ` · ${b.partySize} ${b.partySize === 1 ? "person" : "people"}` : ""}
                      </p>
                    </div>
                    <Badge
                      className={`border-0 capitalize text-xs ${STATUS_STYLES[b.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {b.status}
                    </Badge>
                  </button>
                  {i < Math.min(upcoming.length, 3) - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent messages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("dashboard-messages")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {threads === undefined ? (
              <p className="py-6 text-sm text-muted-foreground">Loading…</p>
            ) : threads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No messages yet. Use &ldquo;Message host&rdquo; on a spot&apos;s page to ask a
                question.
              </p>
            ) : (
              threads.slice(0, 3).map((t, i) => (
                <div key={t.id}>
                  <button
                    onClick={() => navigate("dashboard-messages", { threadId: t.id })}
                    className="w-full flex items-center gap-3 py-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t.listing.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelative(t.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {t.lastMessage?.body ?? "No messages yet"}
                      </p>
                    </div>
                    {t.unreadCount > 0 && (
                      <span
                        className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0"
                        aria-label={`${t.unreadCount} unread`}
                      >
                        {t.unreadCount}
                      </span>
                    )}
                  </button>
                  {i < Math.min(threads.length, 3) - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommended && recommended.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended for you</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommended.map((spot) => (
                <a
                  key={spot.id}
                  href={`#/hotspot?id=${encodeURIComponent(spot.id)}`}
                  className="block rounded-lg border overflow-hidden hover:shadow-md motion-safe:transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative h-28 overflow-hidden">
                    <SpotPhoto
                      src={spot.image}
                      alt=""
                      category={spot.category}
                      className="w-full h-full"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-foreground/85 text-background px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-primary" aria-hidden="true" />
                      {spot.vibeScore}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {spot.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {spot.area}
                      {spot.reviews > 0 && (
                        <>
                          <span className="mx-0.5">·</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          {spot.rating}
                        </>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("explore")}
            >
              <Compass className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Explore spots</span>
              <span className="text-xs text-muted-foreground">Discover Lagos hotspots</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("dashboard-add-spot")}
            >
              <PlusCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Add a spot</span>
              <span className="text-xs text-muted-foreground">Submit a new hotspot</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("dashboard-saved")}
            >
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Saved spots</span>
              <span className="text-xs text-muted-foreground">Your bookmarked places</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
