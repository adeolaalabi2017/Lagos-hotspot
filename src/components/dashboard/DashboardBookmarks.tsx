"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/router";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import type { PublicHotspot } from "@/lib/public-listing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, MapPin, Star, Compass } from "lucide-react";
import { toast } from "sonner";

function SavedSpotCard({
  hotspotId,
  onRemove,
}: {
  hotspotId: string;
  onRemove: (id: string) => void;
}) {
  const { navigate } = useRouter();
  const [hotspot, setHotspot] = useState<PublicHotspot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/listings/${hotspotId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setHotspot(data?.hotspot ?? null);
      })
      .catch(() => {
        if (!cancelled) setHotspot(null);
      });
    return () => {
      cancelled = true;
    };
  }, [hotspotId]);

  if (!hotspot) return null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {hotspot.image && (
          <img
            src={hotspot.image}
            alt={hotspot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(hotspot.id);
            toast.success(`Removed "${hotspot.title}" from saved spots`);
          }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white motion-safe:transition-colors shadow-sm"
          aria-label={`Remove ${hotspot.title} from saved spots`}
        >
          <BookmarkCheck className="h-4 w-4 text-primary" />
        </button>
        {hotspot.isTrending && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
            Trending
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-primary font-medium">{hotspot.category}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-foreground">{hotspot.rating}</span>
            <span className="text-xs text-muted-foreground">({hotspot.reviews})</span>
          </div>
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-2 truncate">
          {hotspot.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          {hotspot.area}, {hotspot.city}
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary font-medium">
              Vibe: {hotspot.vibeScore}🔥
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("hotspot", { hotspotId: hotspot.id })}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardBookmarks() {
  const { navigate } = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const maxSaves = TIER_FEATURES[userTier].maxSavedSpots;
  const { bookmarkedIds, removeBookmark, loading, error } =
    useBookmarkStore();

  const saveLimitText = maxSaves === -1
    ? "Unlimited saves"
    : `${bookmarkedIds.length}/${maxSaves} spots saved`;

  const handleRemove = async (id: string) => {
    await removeBookmark(id);
  };

  useEffect(() => {
    if (isAuthenticated) {
      void useBookmarkStore.getState().refresh();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Spots</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your bookmarked Lagos hotspots.{" "}
            <span className={maxSaves !== -1 && bookmarkedIds.length >= maxSaves ? "text-destructive font-medium" : "text-primary font-medium"}>
              {saveLimitText}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("explore")}>
          <Compass className="h-4 w-4 mr-2" />
          Explore More Spots
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : loading && bookmarkedIds.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarkedIds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedIds.map((hotspotId) => (
            <SavedSpotCard key={hotspotId} hotspotId={hotspotId} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isAuthenticated ? (
              <>
                <h3 className="font-semibold text-foreground mb-1">
                  No saved spots yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring Lagos hotspots and save the ones you love!
                </p>
                <Button onClick={() => navigate("explore")}>
                  <Compass className="h-4 w-4 mr-2" />
                  Start Exploring
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-foreground mb-1">
                  Sign in to see your saved spots
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your bookmarks will sync across devices once you sign in.
                </p>
                <Button onClick={() => navigate("login")}>
                  Sign In
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
