"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { api } from "@/lib/convex-api";
import { priceLevelLabel, priceLevelSymbol } from "@/data/mock-data";
import { isOpenNow, type OpenState } from "@/lib/hours";
import type { PublicHotspot } from "@/lib/public-listing";
import { WriteReviewForm } from "./WriteReviewForm";
import { StartConversationLink } from "./StartConversationLink";
import { ReserveButton } from "./ReserveButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Heart,
  Share2,
  Flame,
  ShieldCheck,
  MessageCircle,
  Instagram,
  ExternalLink,
  ChevronLeft,
  Check,
  Wifi,
  Car,
  AirVent,
  UtensilsCrossed,
  Wine,
  Coffee,
  Music,
  ArrowLeft,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

// ─── Amenity icon map ────────────────────────────────────
const amenityIconMap: Record<string, React.ElementType> = {
  "Wi-Fi": Wifi,
  Parking: Car,
  "Air Conditioning": AirVent,
  "Outdoor Seating": UtensilsCrossed,
  "Full Bar": Wine,
  Cocktail: Wine,
  Coffee: Coffee,
  Music: Music,
};

function getAmenityIcon(amenity: string): React.ElementType {
  for (const [key, icon] of Object.entries(amenityIconMap)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return Check;
}

// ─── Star Rating ─────────────────────────────────────────
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────
function ReviewCard({
  review,
}: {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    author: { id: string; name: string | null; avatar: string | null };
  };
}) {
  return (
    <Card className="border shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
            {review.author.avatar ?? review.author.name?.[0] ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {review.author.name ?? "Anonymous"}
                </h4>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-medium px-1.5 py-0">
                  <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                  {review.rating.toFixed(1)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment ?? "(no comment)"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function SingleListingPage() {
  const router = useRouter();
  const hotspotId = router.params?.id || "1";
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const maxSaves = TIER_FEATURES[userTier].maxSavedSpots;
  const { canSaveMore, toggleBookmark, isBookmarked: checkBookmarked } = useBookmarkStore();
  const isBookmarked = checkBookmarked(hotspotId);
  const [activeTab, setActiveTab] = useState("about");

  const hotspot = useQuery((api as any).hotspots.detail, { id: hotspotId }) as
    | PublicHotspot
    | null
    | undefined;
  const hotspotReviews = useQuery((api as any).hotspots.reviewsByListing, {
    id: hotspotId,
  }) as
    | {
        id: string;
        rating: number;
        comment: string | null;
        createdAt: string;
        author: { id: string; name: string | null; avatar: string | null };
      }[]
    | undefined;
  const similarHotspots = useQuery((api as any).hotspots.similar, {
    id: hotspotId,
    category: hotspot?.category ?? "",
    limit: 3,
  }) as PublicHotspot[] | undefined;
  const reviews = hotspotReviews ?? [];
  const similarList = similarHotspots ?? [];

  const handleSave = () => {
    if (!isBookmarked && !canSaveMore(maxSaves)) {
      toast.error("You've reached your 10-spot save limit. Upgrade to Scout for unlimited saves!");
      return;
    }
    toggleBookmark(hotspotId);
  };

  // Loading state
  if (hotspot === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin mb-4" aria-hidden />
          Loading hotspot…
        </div>
      </div>
    );
  }

  if (!hotspot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Spot not found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t find the hotspot you&apos;re looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => router.navigate("explore")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const whatsappNumber = hotspot.whatsappNumber.replace(/[\s+]/g, "").replace(/^234/, "234");

  // Hours data
  const hours = hotspot.hours || [
    { day: "Monday", time: "9:00 AM - 6:00 PM" },
    { day: "Tuesday", time: "9:00 AM - 6:00 PM" },
    { day: "Wednesday", time: "9:00 AM - 6:00 PM" },
    { day: "Thursday", time: "9:00 AM - 6:00 PM" },
    { day: "Friday", time: "9:00 AM - 6:00 PM" },
    { day: "Saturday", time: "10:00 AM - 4:00 PM" },
    { day: "Sunday", time: "Closed" },
  ];

  const features = hotspot.amenities || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.navigate("explore")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Explore
        </Button>
      </div>

      {/* Hero Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative rounded-xl overflow-hidden">
          {hotspot.image && (
            <img
              src={hotspot.image}
              alt={hotspot.title}
              className="w-full h-[240px] sm:h-[340px] lg:h-[420px] object-cover"
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {hotspot.isVerified && (
              <Badge className="bg-green-600 text-white border-0 flex items-center gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <OpenNowBadge
              hours={
                (hotspot.hours as unknown as { dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }[] | null) ??
                null
              }
              legacyIsOpen={hotspot.isOpen}
            />
            {hotspot.isTrending && (
              <Badge className="bg-orange-500 text-white border-0 flex items-center gap-1 text-xs">
                <Flame className="h-3 w-3" />
                Trending
              </Badge>
            )}
          </div>

          {/* Heart button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
            onClick={handleSave}
          >
            <Heart
              className={`h-5 w-5 ${
                isBookmarked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </Button>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                {hotspot.category}
              </Badge>
              {hotspot.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-white/30 text-white text-xs bg-foreground/60"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {hotspot.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{hotspot.rating}</span>
                <span className="text-sm text-white/70">({hotspot.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{hotspot.area}, {hotspot.city}</span>
              </div>
              <span className="font-semibold">
                {priceLevelSymbol((hotspot.priceLevel ?? 1) as 1 | 2 | 3 | 4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content — Left 2/3 */}
          <div className="lg:w-2/3">
            {/* Vibe Score */}
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-foreground">Vibe Score</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{hotspot.vibeScore}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${hotspot.vibeScore}%`,
                      background:
                        hotspot.vibeScore >= 90
                          ? "linear-gradient(90deg, #ef4444, #f97316)"
                          : hotspot.vibeScore >= 75
                            ? "linear-gradient(90deg, #f97316, #eab308)"
                            : "linear-gradient(90deg, #eab308, #a3a3a3)",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {hotspot.vibeScore >= 90
                    ? "🔥 One of the hottest spots in Lagos right now!"
                    : hotspot.vibeScore >= 75
                      ? "⚡ Very popular with the Lagos crowd"
                      : "👍 A solid choice for a good time"}
                </p>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-4 bg-muted/50">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="mt-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-3">About {hotspot.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {hotspot.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {hotspot.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {features.map((feature: string) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hours Tab */}
              <TabsContent value="hours" className="mt-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Opening Hours</h2>
                    <div className="space-y-2">
                      {hours.map((h) => (
                        <div
                          key={h.day}
                          className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                        >
                          <span className="text-sm font-medium text-foreground">{h.day}</span>
                          <span
                            className={`text-sm ${
                              h.time === "Closed"
                                ? "text-red-500 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Amenities Tab */}
              <TabsContent value="amenities" className="mt-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {hotspot.amenities.map((amenity) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            <Icon className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Reviews ({hotspot.reviews})
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold">{hotspot.rating}</span>
                      </div>
                    </div>
                    {reviews.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <WriteReviewForm hotspotId={hotspot.id} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar — Right 1/3 */}
          <div className="lg:w-1/3 space-y-4">
            {/* Quick Info Card */}
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Quick Info</h3>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{hotspot.area}</p>
                    <p className="text-xs text-muted-foreground">{hotspot.city}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {priceLevelSymbol((hotspot.priceLevel ?? 1) as 1 | 2 | 3 | 4)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {priceLevelLabel((hotspot.priceLevel ?? 1) as 1 | 2 | 3 | 4)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{hotspot.phone}</span>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 shrink-0" />
                  <Badge
                    className={`text-xs border-0 ${
                      hotspot.isOpen
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {hotspot.isOpen ? "Currently Open" : "Currently Closed"}
                  </Badge>
                </div>

                {/* Reserve CTA */}
                <ReserveButton
                  hotspotId={hotspot.id}
                  hotspotTitle={hotspot.title}
                  className="w-full"
                />

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>

                {/* Message host (in-app) */}
                <div className="w-full">
                  <StartConversationLink
                    hotspotId={hotspot.id}
                    hotspotTitle={hotspot.title}
                    variant="outline"
                  />
                </div>

                {/* Instagram link */}
                <a
                  href={`https://instagram.com/${hotspot.instagramHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <Instagram className="h-4 w-4 mr-2" />
                    {hotspot.instagramHandle}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </a>

                {/* Share & Report */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      toast.success("Report submitted. We'll review this spot.");
                    }}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Similar Spots */}
            {similarList.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground mb-4">Similar Spots</h3>
                  <div className="space-y-3">
                    {similarList.map((similar) => (
                      <button
                        type="button"
                        key={similar.id}
                        className="w-full flex gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
                        onClick={() => router.navigate("hotspot", { id: similar.id })}
                        aria-label={`View ${similar.title}`}
                      >
                        {similar.image && (
                          <img
                            src={similar.image}
                            alt={similar.title}
                            className="h-16 w-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {similar.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium">{similar.rating}</span>
                            <span className="text-xs text-muted-foreground">({similar.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {similar.area}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OpenNowBadgeProps {
  hours:
    | {
        dayOfWeek: number;
        opensAt: string | null;
        closesAt: string | null;
        isClosed: boolean;
      }[]
    | null;
  legacyIsOpen: boolean;
}

function OpenNowBadge({ hours, legacyIsOpen }: OpenNowBadgeProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const state: OpenState = useMemo(
    () =>
      hours && hours.length > 0
        ? isOpenNow(hours, legacyIsOpen, now)
        : isOpenNow(null, legacyIsOpen, now),
    [hours, legacyIsOpen, now]
  );
  if (state.state === "open-now") {
    return (
      <Badge className="bg-emerald-600 text-white border-0 text-xs">
        Open now
        {state.until ? ` · until ${state.until}` : ""}
      </Badge>
    );
  }
  if (state.state === "closed-now" && state.opensAt) {
    return (
      <Badge className="bg-amber-500 text-white border-0 text-xs">
        Opens at {state.opensAt}
      </Badge>
    );
  }
  if (state.state === "closed-today") {
    return (
      <Badge className="bg-red-600 text-white border-0 text-xs">
        Closed today
      </Badge>
    );
  }
  return (
    <Badge
      className={`text-xs border-0 ${
        legacyIsOpen
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {legacyIsOpen ? "Open" : "Closed"}
    </Badge>
  );
}
