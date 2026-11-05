"use client";

import { GuideCover } from "@/components/pages/GuideCover";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { api } from "@/lib/convex-api";
import {
  categories,
  blogPosts,
  neighborhoods,
} from "@/data/mock-data";
import type { PublicHotspot } from "@/lib/public-listing";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Flame,
  Heart,
  UtensilsCrossed,
  Wine,
  Umbrella,
  Palette,
  Coffee,
  ShoppingBag,
  Music,
  Flower2,
  Store,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Map icon string names to Lucide components (only those referenced in mock-data)
const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Wine,
  Umbrella,
  Palette,
  Coffee,
  ShoppingBag,
  Music,
  Flower2,
  Store,
  Building2: MapPin,
  Sparkles,
  Heart,
};


import { useBrandAssets } from "@/lib/use-brand-assets";
import { SpotPhoto } from "@/components/listings/SpotPhoto";
import { VibeBadge } from "@/components/listings/VibeBadge";
import { isOpenNow, openStateLabel } from "@/lib/hours";

const BRAND_FALLBACKS = {
  logo: "/images/lagos-hotspot-logo.png",
  favicon: "/images/lagos-hotspot-favicon.png",
  hero: "/images/lagos-hotspot-Ikoyi-link-bridge.webp",
};

export default function HomePage() {
  const brand = useBrandAssets();
  const heroUrl = brand.hero?.url || BRAND_FALLBACKS.hero;
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchArea, setSearchArea] = useState("");

  const trendingSpots = useQuery((api as any).hotspots.feed, {
    trendingOnly: true,
    sort: "trending",
    limit: 4,
  }) as PublicHotspot[] | undefined;
  // Every published spot, to count spots per neighbourhood.
  const allSpots = useQuery((api as any).hotspots.feed, {}) as PublicHotspot[] | undefined;
  const spotsByArea = new Map<string, number>();
  for (const spot of allSpots ?? []) {
    spotsByArea.set(spot.area, (spotsByArea.get(spot.area) ?? 0) + 1);
  }
  const featuredSpots = useQuery((api as any).hotspots.feed, {
    featuredOnly: true,
    sort: "rating",
    limit: 3,
  }) as PublicHotspot[] | undefined;

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (searchArea && searchArea !== "all") params.area = searchArea;
    navigate("explore", params);
  };

  return (
    <div>
      {/* Hero: the Lekki-Ikoyi Link Bridge at night, copy on its dark left side */}
      <section className="relative min-h-[100svh] flex items-end lg:items-center overflow-hidden bg-[oklch(0.14_0.01_40)]">
        <div
          className="absolute inset-0 bg-cover bg-[position:72%_center] lg:bg-right"
          style={{ backgroundImage: `url('${heroUrl}')` }}
          role="img"
          aria-label="The Lekki-Ikoyi Link Bridge in Lagos at night"
        >
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/90 via-black/65 to-black/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:py-24 w-full">
          <div className="max-w-2xl">
            <h1 className="font-display text-[40px] sm:text-6xl lg:text-7xl font-medium text-white leading-[1.02] tracking-tight text-balance">
              Restaurants, clubs and beaches in Lagos
            </h1>
            <p className="mt-6 text-lg text-white max-w-xl text-pretty">
              {allSpots && allSpots.length > 0
                ? `${allSpots.length} ${allSpots.length === 1 ? "spot" : "spots"} across ${spotsByArea.size} ${spotsByArea.size === 1 ? "neighbourhood" : "neighbourhoods"} so far, each one checked by our team before it goes live.`
                : "Every spot is checked by our team before it goes live."}
            </p>

            {/* Search Bar */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="mt-8 bg-white rounded-xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 relative">
                <label htmlFor="hero-search" className="sr-only">
                  Search spots
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hero-search"
                  type="search"
                  placeholder="Try suya, rooftop bar or beach club"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-0 h-11 text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0"
                />
              </div>
              <div className="w-full sm:w-44">
                <label htmlFor="hero-area" className="sr-only">
                  Filter by area
                </label>
                <Select value={searchArea} onValueChange={setSearchArea}>
                  <SelectTrigger
                    id="hero-area"
                    className="h-11 w-full border-0 bg-muted text-foreground"
                  >
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="All areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n.id} value={n.name}>
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="h-11 px-6">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </form>

            {/* Category shortcuts: filters, drawn as chips rather than buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.slice(0, 4).map((cat) => {
                const Icon = iconMap[cat.icon] || Flame;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      navigate("explore", { category: cat.name })
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 hover:bg-black/75 ring-1 ring-white/25 hover:ring-white/50 text-white text-sm font-medium backdrop-blur-sm motion-safe:transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 lg:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trending spots in Lagos"
            lead="The places people are saving and reviewing most this week."
            action={{ label: "See trending spots", onClick: () => navigate("explore", { sort: "trending" }) }}
          />

          {trendingSpots === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <HotspotSkeleton key={i} />
              ))}
            </div>
          ) : trendingSpots.length === 0 ? (
            <p className="text-muted-foreground py-12">No trending spots yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingSpots.map((spot) => (
                <HotspotCard key={spot.id} spot={spot} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Spots our editors recommend"
            lead="Places we keep going back to, chosen by the Lagos Hotspot team."
            action={{ label: "See all spots", onClick: () => navigate("explore") }}
          />

          {featuredSpots === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeaturedSkeleton key={i} />
              ))}
            </div>
          ) : featuredSpots.length === 0 ? (
            <p className="text-muted-foreground py-12">No featured spots yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSpots.map((spot) => (
                <FeaturedCard key={spot.id} spot={spot} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Neighbourhoods: type-led tiles, no stock photos */}
      <section className="py-20 lg:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Spots by neighbourhood"
            lead="From the clubs of Victoria Island to the street food of Yaba. Pick an area to see what is there."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighborhoods.map((nhood) => {
              const n = spotsByArea.get(nhood.name) ?? 0;
              return (
                <button
                  key={nhood.id}
                  onClick={() => navigate("explore", { area: nhood.name })}
                  className="group flex flex-col justify-between min-h-44 rounded-xl border bg-card p-6 text-left hover:-translate-y-0.5 hover:border-foreground/25 motion-safe:transition-[transform,border-color] motion-safe:duration-200"
                >
                  <div>
                    <h3 className="font-display text-2xl lg:text-[28px] font-medium tracking-tight">
                      {nhood.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 text-pretty">
                      {nhood.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className={n > 0 ? "font-medium text-foreground tabular-nums" : "text-muted-foreground"}>
                      {allSpots === undefined ? "\u00a0" : n === 0 ? "No spots yet" : `${n} ${n === 1 ? "spot" : "spots"}`}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 motion-safe:transition-[color,transform]"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="How Lagos Hotspot works"
            lead="Every spot and every review is read by our team before it goes live."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Search,
                title: "Search by area, category or price",
                description:
                  "Filter by what is open now, price level and rating to narrow the list down fast.",
              },
              {
                icon: Star,
                title: "Read reviews from Lagosians",
                description:
                  "Reviews come from people who went. We check each one before it appears.",
              },
              {
                icon: MessageCircle,
                title: "Book a table on WhatsApp",
                description:
                  "Message a spot directly to reserve, and save the places you want to try.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl border bg-card">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-20 lg:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Guides to Lagos"
            lead="Neighbourhood guides and long reads from the city."
            action={{ label: "Read all guides", onClick: () => navigate("blog") }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:-translate-y-0.5 hover:shadow-md motion-safe:transition-[transform,box-shadow] cursor-pointer group"
                onClick={() => navigate("blog-detail", { postId: post.id })}
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  <GuideCover src={post.image} category={post.category} className="w-full h-full group-hover:scale-[1.03] motion-safe:transition-transform motion-safe:duration-500" />
                </div>
                <CardContent className="p-5">
                  <p className="text-[13px] font-medium text-muted-foreground mb-2">{post.category}</p>
                  <h3 className="font-medium text-lg leading-snug mb-2 line-clamp-2 text-pretty">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action: one, for owners and locals alike */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-foreground text-background p-8 sm:p-12 lg:p-16 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="font-display text-4xl lg:text-5xl font-medium tracking-tight text-pretty">
                Add a spot to Lagos Hotspot
              </h2>
              <p className="mt-4 text-lg text-background/80 max-w-xl text-pretty">
                Own a place, or know one we have missed? Listing is free during launch, and our team reviews every spot within a few days.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button size="lg" onClick={() => navigate("register")}>
                Add a spot
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Section header: one heading, one line under it, one optional action ───
function SectionHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10 lg:mb-12">
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl lg:text-5xl font-medium tracking-tight text-pretty">
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 text-lg text-pretty">{lead}</p>
      </div>
      {action && (
        <Button variant="outline" size="lg" onClick={action.onClick} className="self-start sm:self-auto shrink-0">
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ─── Hotspot Card (Grid) ─────────────────────────────────
function HotspotSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card basis-full sm:basis-1/2 lg:basis-1/3">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <div className="p-5 space-y-2">
        <div className="h-5 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
      </div>
    </div>
  );
}

function HotspotCard({
  spot,
  navigate,
}: {
  spot: PublicHotspot;
  navigate: (route: "hotspot", params?: Record<string, string>) => void;
}) {
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const maxSaves = TIER_FEATURES[userTier].maxSavedSpots;
  const { canSaveMore, toggleBookmark, isBookmarked: checkBookmarked } = useBookmarkStore();
  const isBookmarked = checkBookmarked(spot.id);
  const openStatus = openStateLabel(isOpenNow(spot.openingHours, spot.isOpen));

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBookmarked && !canSaveMore(maxSaves)) {
      toast.error("You've reached your 10-spot save limit.");
      return;
    }
    toggleBookmark(spot.id);
    toast.success(isBookmarked ? "Removed from saved" : "Spot saved!");
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-xl hover:-translate-y-0.5 motion-safe:transition-all motion-safe:duration-300 cursor-pointer group"
      onClick={() => navigate("hotspot", { id: spot.id })}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <SpotPhoto
          src={spot.image}
          alt={`${spot.title} in ${spot.area}`}
          category={spot.category}
          loading="lazy"
          className="w-full h-full group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-500"
        />
        <VibeBadge score={spot.vibeScore} reviews={spot.reviews} className="absolute top-3 left-3" />
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 motion-safe:transition-colors flex items-center justify-center"
          aria-label="Save spot"
        >
          <Heart
            className={`h-4 w-4 motion-safe:transition-transform motion-safe:duration-200 ${
              isBookmarked ? "fill-red-500 text-red-500 scale-110" : "text-white"
            }`}
          />
        </button>
        {/* Open/Closed */}
        {openStatus && (
          <div
            className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-xs font-medium ${openStatus.className}`}
          >
            {openStatus.label}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-medium leading-snug line-clamp-1">{spot.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{spot.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          {spot.area}
          <span className="mx-1">·</span>
          <span>{"₦".repeat(spot.priceLevel ?? 1)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {spot.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs py-0 px-1.5">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Featured Card (Large) ───────────────────────────────
function FeaturedCard({
  spot,
  navigate,
}: {
  spot: PublicHotspot;
  navigate: (route: "hotspot", params?: Record<string, string>) => void;
}) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg motion-safe:transition-shadow cursor-pointer group"
      onClick={() => navigate("hotspot", { id: spot.id })}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <SpotPhoto
          src={spot.image}
          alt={`${spot.title} in ${spot.area}`}
          category={spot.category}
          loading="lazy"
          className="w-full h-full group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">
              <Flame className="h-3 w-3 mr-1" />
              Featured
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 text-xs"
            >
              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
              {spot.rating}
            </Badge>
          </div>
          <h3 className="text-lg font-medium leading-snug text-white">{spot.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {spot.description}
        </p>
        <div className="flex items-center">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {spot.area}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
