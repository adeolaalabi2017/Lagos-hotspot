"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/lib/router";
import { useBookmarkStore } from "@/lib/bookmark-store";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Compass } from "lucide-react";
import { toast } from "sonner";

function SavedSpotCard({
  hotspotId,
  onRemove,
}: {
  hotspotId: string;
  onRemove: (id: string) => void;
}) {
  const { navigate } = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-40 bg-muted overflow-hidden flex items-center justify-center">
        <Compass className="h-8 w-8 text-muted-foreground" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-2 truncate">
          {hotspotId.slice(0, 8)}
        </h3>
        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("hotspot", { id: hotspotId })}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onRemove(hotspotId);
              toast.success("Removed from saved spots");
            }}
            aria-label="Remove from saved spots"
          >
            <BookmarkCheck className="h-4 w-4 text-primary" />
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
  const { bookmarkedIds, removeBookmark } = useBookmarkStore();

  const saveLimitText = maxSaves === -1
    ? "Unlimited saves"
    : `${bookmarkedIds.length}/${maxSaves} spots saved`;

  const handleRemove = (id: string) => {
    removeBookmark(id);
  };

  useEffect(() => {
    if (isAuthenticated) {
      useBookmarkStore.getState().refresh();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
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

      {bookmarkedIds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedIds.map((hotspotId) => (
            <SavedSpotCard key={hotspotId} hotspotId={hotspotId} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
