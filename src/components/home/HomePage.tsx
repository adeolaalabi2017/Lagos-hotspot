"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  categories,
  reviews,
  pricingPlans,
  blogPosts,
  neighborhoods,
} from "@/data/mock-data";
import type { PublicHotspot } from "@/lib/public-listing";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  ArrowRight,
  Check,
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
  ShieldCheck,
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

const HERO_WORDS = ["Pulse", "Vibe", "Rhythm", "Energy", "Soul", "Beat"] as const;
const LONGEST_HERO_WORD = HERO_WORDS.reduce((a, b) => (a.length >= b.length ? a : b));

export default function HomePage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchArea, setSearchArea] = useState("");

  // Animated word cycling for hero heading
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % HERO_WORDS.length);
        setFade(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const [trendingSpots, setTrendingSpots] = useState<PublicHotspot[]>([]);
  const [featuredSpots, setFeaturedSpots] = useState<PublicHotspot[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [trendingRes, featuredRes] = await Promise.all([
          fetch("/api/listings?trending=true&sort=rating"),
          fetch("/api/listings?featured=true&sort=rating"),
        ]);
        if (cancelled) return;
        if (trendingRes.ok) {
          const data = (await trendingRes.json()) as {
            hotspots: PublicHotspot[];
          };
          setTrendingSpots(data.hotspots.slice(0, 4));
        }
        if (featuredRes.ok) {
          const data = (await featuredRes.json()) as {
            hotspots: PublicHotspot[];
          };
          setFeaturedSpots(data.hotspots.slice(0, 3));
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to load homepage sections", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    else if (!searchQuery) params.q = HERO_WORDS[wordIndex];
    if (searchArea) params.area = searchArea;
    navigate("explore", params);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/lagos-hotspot-Ikoyi-link-bridge.webp')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-primary/90 text-primary-foreground mb-5 border-0 text-sm px-4 py-2 font-semibold">
              Lagos&apos; #1 Hotspot Guide
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-[1.05] tracking-tight">
              Find your next{" "}
              <span
                aria-label={`Word cycling: ${HERO_WORDS.join(', ')}`}
                className="inline-block text-amber-400 text-center align-baseline motion-safe:transition-[opacity,transform] motion-safe:duration-400 motion-safe:ease-out"
                style={{
                  minWidth: `${LONGEST_HERO_WORD.length}ch`,
                  opacity: fade ? 1 : 0,
                  transform: fade ? "translateY(0)" : "translateY(-8px)",
                }}
              >
                {HERO_WORDS[wordIndex]}
              </span>
              <span className="block text-white/85 font-display italic font-normal text-3xl sm:text-4xl lg:text-5xl mt-2">
                in the city that never sleeps.
              </span>
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
              Search 1,000+ vetted restaurants, clubs, beaches, and hidden
              corners across Lagos.
            </p>

            {/* Search Bar */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="bg-white rounded-xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative">
                <label htmlFor="hero-search" className="sr-only">
                  Search spots
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hero-search"
                  type="search"
                  placeholder={`Try “${HERO_WORDS[wordIndex].toLowerCase()}” — or anything else`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-0 h-11 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0"
                />
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="hero-area" className="sr-only">
                  Filter by area
                </label>
                <Select value={searchArea} onValueChange={setSearchArea}>
                  <SelectTrigger
                    id="hero-area"
                    className="h-11 border-0 bg-muted/50"
                  >
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="All Areas" />
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
              </div>
              <Button type="submit" className="h-11 px-6">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {/* Categories inside Hero — fast-lane pills (top 4) */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-10 max-w-3xl mx-auto">
              {categories.slice(0, 4).map((cat) => {
                const Icon = iconMap[cat.icon] || Flame;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      navigate("explore", { category: cat.name })
                    }
                    className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/15 hover:ring-white/30 backdrop-blur-0 motion-safe:transition-colors"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-sm sm:text-base font-medium text-white">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => navigate("explore")}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 motion-safe:transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold">
                  Explore all
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending / Hot Right Now */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
                Hot Right Now
              </h2>
              <p className="text-muted-foreground mt-3 text-pretty">
                The four spots everyone is talking about this week.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("explore", { sort: "trending" })}
              className="hidden sm:flex shrink-0"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSpots.map((spot) => (
              <HotspotCard key={spot.id} spot={spot} navigate={navigate} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("explore", { sort: "trending" })}>
              View All Trending
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Spots */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
                Editor&apos;s Picks
              </h2>
              <p className="text-muted-foreground mt-3 text-pretty">
                Three places we keep coming back to, no matter the season.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("explore")}
              className="hidden sm:flex shrink-0"
            >
              Explore All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="gap-6">
              {featuredSpots.map((spot) => (
                <CarouselItem key={spot.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <FeaturedCard spot={spot} navigate={navigate} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex -left-6" />
            <CarouselNext className="hidden lg:flex -right-6" />
          </Carousel>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
                Pick a neighborhood.
              </h2>
              <h3 className="font-display text-3xl lg:text-5xl italic font-normal text-primary text-pretty">
                We&apos;ll do the rest.
              </h3>
            </div>
            <p className="text-muted-foreground lg:col-span-5 text-pretty">
              Each Lagos postcode tells its own story. Browse by area to find
              the vibe that matches yours — from the buzz of VI to the calm of
              Ikoyi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {neighborhoods.map((nhood) => (
              <button
                key={nhood.id}
                onClick={() => navigate("explore", { area: nhood.name })}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] text-left"
              >
                {nhood.image && (
                  <img
                    src={nhood.image}
                    alt={`${nhood.name} neighborhood in Lagos`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] motion-safe:transition-transform motion-safe:duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {nhood.name}
                  </h3>
                  <p className="text-white/70 text-sm line-clamp-2 mb-2">
                    {nhood.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {nhood.hotspotCount} spots
                    </Badge>
                    <span className="text-primary text-sm font-medium group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
              How Lagos Hotspot Works
            </h2>
            <p className="text-muted-foreground mt-3 text-pretty">
              Three honest steps. No &quot;AI concierge&quot;, no upsell — just
              real Lagosians&apos; reviews.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Search & Discover",
                description:
                  "Browse hotspots by category, area, or vibe score. Filter by price, ratings, and what's open now.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Star,
                title: "Read Reviews",
                description:
                  "See what other Lagosians are saying. Verified reviews help you pick the perfect spot every time.",
                color: "bg-accent text-accent-foreground",
              },
              {
                icon: MessageCircle,
                title: "Connect & Visit",
                description:
                  "WhatsApp spots directly for reservations. Save your favorites and share with friends.",
                color: "bg-secondary text-secondary-foreground",
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="text-center p-6 rounded-xl border bg-card hover:shadow-lg motion-safe:transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
              What Lagosians are saying.
            </h2>
            <p className="text-muted-foreground mt-3 text-pretty">
              Real reviews from people who actually live here.
            </p>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="gap-6">
              {reviews.slice(0, 3).map((review) => (
                <CarouselItem key={review.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="hover:shadow-lg motion-safe:transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {review.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.user}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex -left-6" />
            <CarouselNext className="hidden lg:flex -right-6" />
          </Carousel>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto mb-14 text-center">
            <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
              Pick the plan that fits.
            </h2>
            <p className="text-muted-foreground mt-3 text-pretty">
              Whether you&apos;re exploring Lagos or listing your own spot, we
              have a tier for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  plan.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="pb-2 flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      if (plan.id === "ambassador") {
                        navigate("contact-us");
                      } else {
                        navigate("register");
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl lg:text-5xl font-semibold tracking-tight text-pretty">
                Lagos Stories & Guides
              </h2>
              <p className="text-muted-foreground mt-3 text-pretty">
                Long reads, neighbourhood guides, and dispatches from the
                city.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("blog")}
              className="hidden sm:flex shrink-0"
            >
              All Articles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-lg motion-safe:transition-shadow cursor-pointer group"
                onClick={() => navigate("blog-detail", { id: post.id })}
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-500"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="font-semibold mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-orange-700 p-8 lg:p-16 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Know a Hot Spot in Lagos?
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8">
                Help the community discover amazing places. Submit your favorite
                spots and earn ambassador status.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("register")}
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 bg-white/10 text-white font-semibold hover:bg-white/20 hover:text-white hover:border-white"
                  onClick={() => navigate("explore")}
                >
                  Explore Spots
                </Button>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Hotspot Card (Grid) ─────────────────────────────────
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

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBookmarked && !canSaveMore(maxSaves)) {
      toast.error("You've reached your 10-spot save limit. Upgrade to Scout for unlimited saves!");
      return;
    }
    toggleBookmark(spot.id);
    toast.success(isBookmarked ? "Removed from saved" : "Spot saved!");
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg motion-safe:transition-shadow cursor-pointer group"
      onClick={() => navigate("hotspot", { id: spot.id })}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {spot.image && (
          <img
            src={spot.image}
            alt={`${spot.title} in ${spot.area}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-500"
          />
        )}
        {/* Vibe Score Badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Flame className="h-3 w-3 text-primary" />
          {spot.vibeScore}
        </div>
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-foreground/70 hover:bg-foreground/90 motion-safe:transition-colors flex items-center justify-center"
          aria-label="Save spot"
        >
          <Heart
            className={`h-4 w-4 ${
              isBookmarked ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>
        {/* Open/Closed */}
        <div
          className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-xs font-medium ${
            spot.isOpen
              ? "bg-emerald-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {spot.isOpen ? "Open Now" : "Closed"}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-1">{spot.title}</h3>
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
        {spot.image && (
          <img
            src={spot.image}
            alt={`${spot.title} in ${spot.area}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-500"
          />
        )}
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
          <h3 className="text-lg font-bold text-white">{spot.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {spot.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {spot.area}
          </div>
          <span className="text-sm font-medium text-primary">
            View Details →
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
