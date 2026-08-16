"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { categories, neighborhoods } from "@/data/mock-data";
import type { PublicHotspot } from "@/lib/public-listing";
import { api } from "@/lib/convex-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Star,
  Flame,
  Heart,
  SlidersHorizontal,
  X,
  Grid,
  List,
  ChevronDown,
  Clock,
  RefreshCcw,
} from "lucide-react";

// ─── Price level display ─────────────────────────────────
const priceLevelSymbol = (level: number): string => "₦".repeat(level);

// ─── Sort options ────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "trending", label: "Most Trending" },
  { value: "newest", label: "Newest" },
];

// ─── Page Hero ───────────────────────────────────────────
function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/images/lagos-hotspot-Ikoyi-link-bridge.webp')] bg-cover bg-center opacity-25 motion-safe:transition-opacity"
        role="img"
        aria-label="Lekki-Ikoyi Link Bridge, Lagos"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{title}</h1>
        <p className="text-lg sm:text-xl text-white/80 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}

// ─── Star Rating Helper ──────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Vibe Badge ──────────────────────────────────────────
function VibeBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-red-500 text-white"
      : score >= 75
        ? "bg-orange-500 text-white"
        : score >= 50
          ? "bg-amber-500 text-white"
          : "bg-gray-500 text-white";
  return (
    <Badge className={`${color} text-[10px] font-bold border-0 gap-0.5 px-1.5 py-0.5`}>
      <Flame className="h-3 w-3" />
      {score}
    </Badge>
  );
}

// ─── Hotspot Card ────────────────────────────────────────
function HotspotCard({ hotspot, viewMode }: { hotspot: PublicHotspot; viewMode: "grid" | "list" }) {
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const maxSaves = TIER_FEATURES[userTier].maxSavedSpots;
  const { canSaveMore, toggleBookmark, isBookmarked: checkBookmarked } = useBookmarkStore();
  const isBookmarked = checkBookmarked(hotspot.id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBookmarked && !canSaveMore(maxSaves)) {
      toast.error("You've reached your 10-spot save limit. Upgrade to Scout for unlimited saves!");
      return;
    }
    toggleBookmark(hotspot.id);
  };

  if (viewMode === "list") {
    return (
      <a
        href={`#/hotspot?id=${encodeURIComponent(hotspot.id)}`}
        className="block overflow-hidden hover:shadow-lg motion-safe:transition-all duration-300 group p-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${hotspot.title} in ${hotspot.area}`}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-72 sm:min-h-[200px] overflow-hidden">
            {hotspot.image && (
              <img
                src={hotspot.image}
                alt={hotspot.title}
                className="w-full h-48 sm:h-full object-cover group-hover:scale-105 motion-safe:transition-transform duration-500"
                loading="lazy"
              />
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <VibeBadge score={hotspot.vibeScore} />
              <Badge
                className={`text-[10px] font-medium border-0 ${
                  hotspot.isOpen
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {hotspot.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          <CardContent className="flex-1 p-4 sm:p-5">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                    {hotspot.category}
                  </Badge>
                  {hotspot.isVerified && (
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] flex items-center gap-0.5 px-1.5 py-0">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary motion-safe:transition-colors">
                  {hotspot.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {hotspot.description}
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{hotspot.rating}</span>
                    <span className="text-xs text-muted-foreground">({hotspot.reviews})</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    {priceLevelSymbol((hotspot.priceLevel ?? 1) as 1 | 2 | 3 | 4)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {hotspot.area}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(e);
                  }}
                  aria-label={isBookmarked ? "Remove from saved" : "Save spot"}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isBookmarked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </a>
    );
  }

  // Grid card
  return (
    <a
      href={`#/hotspot?id=${encodeURIComponent(hotspot.id)}`}
      className="block overflow-hidden hover:shadow-lg motion-safe:transition-all duration-300 group p-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${hotspot.title} in ${hotspot.area}`}
    >
      <div className="relative overflow-hidden">
        {hotspot.image && (
          <img
            src={hotspot.image}
            alt={hotspot.title}
            className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 motion-safe:transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <VibeBadge score={hotspot.vibeScore} />
          <Badge
            className={`text-[10px] font-medium border-0 ${
              hotspot.isOpen
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {hotspot.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-9 w-9 rounded-full bg-foreground/70 hover:bg-foreground/90 text-background relative z-10"
          onClick={(e) => {
            e.stopPropagation();
            handleSave(e);
          }}
          aria-label={isBookmarked ? "Remove from saved" : "Save spot"}
        >
          <Heart
            className={`h-4 w-4 ${
              isBookmarked
                ? "fill-red-500 text-red-500"
                : "text-white hover:text-red-400"
            }`}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
            {hotspot.category}
          </Badge>
          {hotspot.isTrending && (
            <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] flex items-center gap-0.5 px-1.5 py-0">
              <Flame className="h-2.5 w-2.5" />
              Trending
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {hotspot.title}
        </h3>
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={hotspot.rating} />
          <span className="text-xs font-semibold text-foreground">{hotspot.rating}</span>
          <span className="text-xs text-muted-foreground">({hotspot.reviews})</span>
        </div>
        <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{hotspot.area}</span>
          <span className="text-muted-foreground/50 mx-1">·</span>
          <span className="text-xs font-semibold text-primary">
            {priceLevelSymbol((hotspot.priceLevel ?? 1) as 1 | 2 | 3 | 4)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {hotspot.tags.slice(0, 3).map((tag: string) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] text-muted-foreground border-muted"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </a>
  );
}

// ─── Filter Controls (shared between desktop & mobile) ───
interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedArea: string;
  setSelectedArea: (a: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedPrice: string;
  setSelectedPrice: (p: string) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (o: boolean) => void;
  selectedSort: string;
  setSelectedSort: (s: string) => void;
  compact?: boolean;
}

function FilterControls({
  searchQuery,
  setSearchQuery,
  selectedArea,
  setSelectedArea,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  openNowOnly,
  setOpenNowOnly,
  selectedSort,
  setSelectedSort,
  compact = false,
}: FilterControlsProps) {
  // Local clear-all kept for the controls container. The chips-row "Clear all"
  // in the parent component calls setFilters({}) which goes through the URL.
  const clearAllLocal = () => {
    setSearchQuery("");
    setSelectedArea("all");
    setSelectedCategory("all");
    setSelectedPrice("all");
    setOpenNowOnly(false);
    setSelectedSort("rating");
  };

  return (
    <div className={`flex flex-col gap-3 ${compact ? "" : "w-full"}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hotspots, tags, areas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdowns row */}
      <div className={`flex flex-wrap gap-2 ${compact ? "flex-col" : "items-center"}`}>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className={`${compact ? "w-full" : "w-[160px]"} h-9 text-sm`}>
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n.id} value={n.name}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className={`${compact ? "w-full" : "w-[170px]"} h-9 text-sm`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPrice} onValueChange={setSelectedPrice}>
          <SelectTrigger className={`${compact ? "w-full" : "w-[150px]"} h-9 text-sm`}>
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="1">₦ Budget</SelectItem>
            <SelectItem value="2">₦₦ Moderate</SelectItem>
            <SelectItem value="3">₦₦₦ Premium</SelectItem>
            <SelectItem value="4">₦₦₦₦ Luxury</SelectItem>
          </SelectContent>
        </Select>

        {/* Open Now toggle */}
        <Button
          variant={openNowOnly ? "default" : "outline"}
          size="sm"
          className={`h-9 text-sm ${openNowOnly ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => setOpenNowOnly(!openNowOnly)}
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          Open Now
        </Button>

        <Select value={selectedSort} onValueChange={setSelectedSort}>
          <SelectTrigger className={`${compact ? "w-full" : "w-[150px]"} h-9 text-sm`}>
            <ChevronDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* The "Clear all" button that used to live here moved into the chips
          row above the results. The empty-state Clear All is the only place
          users can clear the whole URL-driven filter state from the controls
          area. We keep a fallback inside the mobile sheet for clarity. */}
      {compact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllLocal}
          className="text-muted-foreground hover:text-foreground self-start h-8 text-sm"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Reset filters
        </Button>
      )}
    </div>
  );
}

// ─── Skeleton grid ───────────────────────────────────────
function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      aria-label="Loading hotspots"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-48 sm:h-52 bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Active-filter chip row ──────────────────────────────
interface ActiveChip {
  key: string;
  label: string;
}
function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: ActiveChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="pl-2.5 pr-1 py-1 text-xs flex items-center gap-1 bg-primary/10 text-primary border-0"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`Remove ${chip.label} filter`}
            className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length >= 2 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function GridListingsPage() {
  const { navigate, params } = useRouter();

  // The URL is the single source of truth. Every setter below goes through
  // `navigate("explore", nextParams)` so the URL is shareable, refreshable,
  // and decoupled from React state.
  const initialArea = params.area || "all";
  const initialCategory = params.category || "all";
  const initialSearch = params.q || "";
  const initialSort = params.sort || "rating";
  const initialPrice = params.price || "all";
  const initialOpenNow = params.openNow === "1" || params.openNow === "true";

  // Local mirror state for inputs (so the URL isn't forced to update on
  // every keystroke). The first commit writes the URL; subsequent commits
  // are debounced through the same handler.
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [openNowOnly, setOpenNowOnly] = useState(initialOpenNow);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hotspots = useQuery((api as any).hotspots.search, {
    q: searchQuery || " ",
    area: selectedArea !== "all" ? selectedArea : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  }) as PublicHotspot[] | undefined;
  const loading = hotspots === undefined;
  const error = null as string | null;

  // Build URL params from local state. We do NOT include "all" / empty values
  // so the URL stays readable.
  function buildParams(overrides: Record<string, string | null | undefined> = {}) {
    const next: Record<string, string> = {};
    const s = overrides.q !== undefined ? overrides.q : searchQuery;
    if (s) next.q = s;
    const a = overrides.area !== undefined ? overrides.area : selectedArea;
    if (a && a !== "all") next.area = a;
    const c = overrides.category !== undefined ? overrides.category : selectedCategory;
    if (c && c !== "all") next.category = c;
    const p = overrides.price !== undefined ? overrides.price : selectedPrice;
    if (p && p !== "all") next.price = p;
    const o = overrides.openNow !== undefined ? overrides.openNow : openNowOnly;
    if (o) next.openNow = "1";
    const so = overrides.sort !== undefined ? overrides.sort : selectedSort;
    if (so && so !== "rating") next.sort = so;
    return next;
  }

  // Debounced URL writer so the search box doesn't push a new entry per
  // keystroke. Other setters (select dropdowns, toggles, sort) are immediate.
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function writeUrl(updater: () => void, debounceMs: number) {
    updater();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate("explore", buildParams());
    }, debounceMs);
  }

  // Listings come straight from Convex — no client filter pass.

  // Setter helpers — each writes local state and queues the URL update.
  const setFilters = (patch: Record<string, string | null | undefined>) => {
    if (patch.q !== undefined) setSearchQuery(patch.q ?? "");
    if (patch.area !== undefined) setSelectedArea(patch.area ?? "all");
    if (patch.category !== undefined) setSelectedCategory(patch.category ?? "all");
    if (patch.price !== undefined) setSelectedPrice(patch.price ?? "all");
    if (patch.openNow !== undefined) setOpenNowOnly(patch.openNow === "true" || patch.openNow === "1");
    if (patch.sort !== undefined) setSelectedSort(patch.sort ?? "rating");
    // URL update is immediate for non-text inputs.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate("explore", buildParams(patch));
  };

  const setSearchQueryParam = (q: string) => {
    setSearchQuery(q);
    // Debounce the URL write — only the search box needs it.
    writeUrl(() => {
      /* no-op: state already set above */
    }, 350);
  };

  // Compute the active chips from current URL params.
  const chips: ActiveChip[] = (() => {
    const out: ActiveChip[] = [];
    if (searchQuery) out.push({ key: "q", label: `“${searchQuery}”` });
    if (selectedArea !== "all") out.push({ key: "area", label: selectedArea });
    if (selectedCategory !== "all")
      out.push({ key: "category", label: selectedCategory });
    if (selectedPrice !== "all") {
      const label =
        selectedPrice === "1"
          ? "₦ Budget"
          : selectedPrice === "2"
            ? "₦₦ Moderate"
            : selectedPrice === "3"
              ? "₦₦₦ Premium"
              : "₦₦₦₦ Luxury";
      out.push({ key: "price", label });
    }
    if (openNowOnly) out.push({ key: "openNow", label: "Open Now" });
    if (selectedSort && selectedSort !== "rating")
      out.push({
        key: "sort",
        label: `Sort: ${SORT_OPTIONS.find((s) => s.value === selectedSort)?.label ?? selectedSort}`,
      });
    return out;
  })();

  function clearAllFilters() {
    navigate("explore", {});
  }
  function removeChip(key: string) {
    if (key === "sort") setFilters({ sort: "rating" });
    else if (key === "openNow") setFilters({ openNow: "0" });
    else setFilters({ [key]: "" });
  }

  const areaText = selectedArea !== "all" ? selectedArea : "Lagos";
  const visibleHotspots = hotspots ?? [];

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Explore Lagos Hotspots"
        subtitle="Discover the best restaurants, clubs, beaches, and cultural spaces in Lagos"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Filter Bar */}
        <div className="hidden md:block mb-6">
          <FilterControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQueryParam}
            selectedArea={selectedArea}
            setSelectedArea={(v) => setFilters({ area: v })}
            selectedCategory={selectedCategory}
            setSelectedCategory={(v) => setFilters({ category: v })}
            selectedPrice={selectedPrice}
            setSelectedPrice={(v) => setFilters({ price: v })}
            openNowOnly={openNowOnly}
            setOpenNowOnly={(v) => setFilters({ openNow: v ? "1" : "0" })}
            selectedSort={selectedSort}
            setSelectedSort={(v) => setFilters({ sort: v })}
          />
        </div>

        {/* Mobile Filter Bar */}
        <div className="md:hidden mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotspots..."
                value={searchQuery}
                onChange={(e) => setSearchQueryParam(e.target.value)}
                className="pl-10 pr-10 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQueryParam("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 relative"
                  aria-label={`Filters${chips.length ? ` (${chips.length} active)` : ""}`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {chips.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      {chips.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] overflow-y-auto">
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <SheetDescription className="sr-only">
                  Narrow the hotspot list by area, category, price, and
                  open-now status.
                </SheetDescription>
                <div className="pt-8">
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>
                  <FilterControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQueryParam}
                    selectedArea={selectedArea}
                    setSelectedArea={(v) => setFilters({ area: v })}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={(v) => setFilters({ category: v })}
                    selectedPrice={selectedPrice}
                    setSelectedPrice={(v) => setFilters({ price: v })}
                    openNowOnly={openNowOnly}
                    setOpenNowOnly={(v) => setFilters({ openNow: v ? "1" : "0" })}
                    selectedSort={selectedSort}
                    setSelectedSort={(v) => setFilters({ sort: v })}
                    compact
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active-filter chips row */}
        <ActiveFilterChips
          chips={chips}
          onRemove={removeChip}
          onClearAll={clearAllFilters}
        />

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{visibleHotspots.length}</span>{" "}
            hotspot{visibleHotspots.length !== 1 ? "s" : ""} in{" "}
            <span className="font-semibold text-foreground">{areaText}</span>
          </p>
          <div className="hidden sm:flex items-center gap-1 border rounded-md p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Results grid / list */}
        {visibleHotspots.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleHotspots.map((hotspot) => (
                <HotspotCard key={hotspot.id} hotspot={hotspot} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleHotspots.map((hotspot) => (
                <HotspotCard key={hotspot.id} hotspot={hotspot} viewMode="list" />
              ))}
            </div>
          )
        ) : loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Could not load hotspots
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => clearAllFilters()}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hotspots found
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Try removing a filter or searching for something different.
            </p>
            <Button variant="outline" onClick={() => clearAllFilters()}>
              <X className="h-4 w-4 mr-2" />
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
