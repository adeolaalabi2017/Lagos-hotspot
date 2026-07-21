"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES, TIER_LABELS, TIER_BG_COLORS } from "@/lib/auth-store";
import { useBookmarkStore } from "@/lib/bookmark-store";
import type { PublicHotspot } from "@/lib/public-listing";
import { dashboardStats, recentActivities, messages } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Star,
  MapPin,
  Flame,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
  Compass,
  PlusCircle,
  Bookmark,
  Sparkles,
  Lock,
  Zap,
  Eye,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Star,
  MapPin,
  Flame,
};

const activityIconMap: Record<string, React.ElementType> = {
  review: Star,
  save: Bookmark,
  visit: MapPin,
  share: Flame,
};

// ─── Mock early access hotspots ──────────────────────────
const earlyAccessHotspots = [
  {
    id: "ea-1",
    title: "Skyline Rooftop Lounge",
    category: "Nightlife",
    area: "Ikoyi",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop",
    openingDate: "Coming March 2025",
  },
  {
    id: "ea-2",
    title: "AfroBeat Kitchen",
    category: "Food & Dining",
    area: "Lekki",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    openingDate: "Coming April 2025",
  },
  {
    id: "ea-3",
    title: "Lagos Art Collective",
    category: "Culture & Arts",
    area: "Yaba",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=300&fit=crop",
    openingDate: "Coming February 2025",
  },
];

// ─── Mock trending alerts ────────────────────────────────
const trendingAlerts = [
  { id: "ta-1", text: "🔥 Quilox just hit a 97 vibe score!", time: "2 min ago" },
  { id: "ta-2", text: "⚡ New rooftop bar opening in Ikoyi this Friday", time: "15 min ago" },
  { id: "ta-3", text: "🏖️ Elegushi Beach weekend party trending", time: "1 hour ago" },
  { id: "ta-4", text: "🎵 Live Afrobeat at Bogobiri tonight", time: "3 hours ago" },
];

export default function DashboardHome() {
  const { navigate } = useRouter();
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const tierFeatures = TIER_FEATURES[userTier];
  const { bookmarkedIds } = useBookmarkStore();

  // Fetch recommended hotspots: prefer categories derived from saved spots, fall back to trending
  const [recommendedHotspots, setRecommendedHotspots] = useState<
    PublicHotspot[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    const categorySet = new Set<string>();
    const resolveCategories = async () => {
      // Fetch the bookmarked hotspots to extract their categories
      const ids = [...bookmarkedIds];
      if (ids.length > 0) {
        const responses = await Promise.all(
          ids.slice(0, 8).map((id) =>
            fetch(`/api/listings/${id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        for (const data of responses) {
          if (data?.hotspot?.category)
            categorySet.add(data.hotspot.category);
        }
      }

      // Pick a query — first category if any, else trending
      const params = new URLSearchParams();
      params.set("sort", "rating");
      if (categorySet.size > 0) {
        params.set("category", [...categorySet][0]);
      } else {
        params.set("trending", "true");
      }
      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { hotspots: PublicHotspot[] };
      if (cancelled) return;
      setRecommendedHotspots(
        data.hotspots.filter((h) => !bookmarkedIds.includes(h.id)).slice(0, 3)
      );
    };
    resolveCategories();
    return () => {
      cancelled = true;
    };
  }, [bookmarkedIds]);

  const isScoutOrAbove = userTier === "scout" || userTier === "ambassador";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hey, {user?.name?.split(" ")[0] || "Explorer"}! 🔥
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your Lagos hotspot dashboard. Keep discovering the best spots!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>

      {/* Tier Info Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-white">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">
                    {TIER_LABELS[userTier]} Tier
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TIER_BG_COLORS[userTier]}`}>
                    {TIER_LABELS[userTier]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {userTier === "explorer" && "Save up to 10 spots • Basic search"}
                  {userTier === "scout" && "Unlimited saves • Trending alerts • Priority support"}
                  {userTier === "ambassador" && "List your spot • Analytics • Featured placement"}
                </p>
              </div>
            </div>
            {userTier !== "ambassador" && (
              <Button
                size="sm"
                variant={userTier === "explorer" ? "default" : "outline"}
                onClick={() => navigate("pricing")}
                className="shrink-0"
              >
                <Flame className="h-3.5 w-3.5 mr-1.5" />
                Upgrade Tier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Early Access Section (Scout+) */}
      <Card className={isScoutOrAbove ? "border-primary/20" : "border-muted opacity-75"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Early Access</CardTitle>
              {isScoutOrAbove ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Scout+
                </Badge>
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isScoutOrAbove && (
              <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
                Upgrade to Scout
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isScoutOrAbove ? (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                Available to Scout+ members before public launch
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {earlyAccessHotspots.map((spot) => (
                  <div key={spot.id} className="relative rounded-lg overflow-hidden group">
                    {spot.image && (
                      <img
                        src={spot.image}
                        alt={spot.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px]">
                      Early Access
                    </Badge>
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{spot.title}</h4>
                      <p className="text-[10px] text-white/70">{spot.category} • {spot.area}</p>
                      <p className="text-[10px] text-primary font-medium mt-0.5">{spot.openingDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Upgrade to Scout to see hotspots before they launch publicly
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalized Recommendations (Scout+) */}
      <Card className={isScoutOrAbove ? "" : "border-muted opacity-75"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recommended for You</CardTitle>
              {isScoutOrAbove ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Scout+
                </Badge>
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isScoutOrAbove && (
              <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
                Upgrade to Scout
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isScoutOrAbove ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendedHotspots.map((spot) => (
                <Card
                  key={spot.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate("hotspot", { id: spot.id })}
                >
                  <div className="relative h-28 overflow-hidden">
                    {spot.image && (
                      <img
                        src={spot.image}
                        alt={spot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-foreground/85 text-background px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5 text-primary" />
                      {spot.vibeScore}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{spot.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {spot.area}
                      <span className="mx-0.5">·</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {spot.rating}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Upgrade to Scout for personalized hotspot recommendations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Alerts (Scout+) */}
      <Card className={isScoutOrAbove ? "border-orange-200 bg-orange-50/30" : "border-muted opacity-75"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Trending Alerts</CardTitle>
              {isScoutOrAbove ? (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                  Scout+
                </Badge>
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isScoutOrAbove && (
              <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
                Upgrade to Scout
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isScoutOrAbove ? (
            <div className="space-y-2">
              {trendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors"
                >
                  <p className="text-sm text-foreground">{alert.text}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-3">{alert.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Upgrade to Scout for real-time trending alerts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const IconComp = iconMap[stat.icon] || Heart;
          const isPositive = stat.change?.startsWith("+");
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconComp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 mt-3">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivities.map((activity, index) => {
              const ActIcon = activityIconMap[activity.type] || Clock;
              return (
                <div key={activity.id}>
                  <div className="flex items-start gap-3 py-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ActIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {activity.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Messages Preview */}
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
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <div className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {msg.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {msg.sender}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {msg.text}
                    </p>
                  </div>
                  {msg.unread > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0">
                      {msg.unread}
                    </span>
                  )}
                </div>
                {index < messages.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("explore")}
            >
              <Compass className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Explore Spots</span>
              <span className="text-[10px] text-muted-foreground">Discover Lagos hotspots</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("dashboard-add-spot")}
            >
              <PlusCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Add Spot</span>
              <span className="text-[10px] text-muted-foreground">Submit a new hotspot</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate("dashboard-saved")}
            >
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Saved Spots</span>
              <span className="text-[10px] text-muted-foreground">Your bookmarked places</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
