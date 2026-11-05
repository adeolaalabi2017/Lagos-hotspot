"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/convex-api";
import { SpotPhoto } from "@/components/listings/SpotPhoto";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, MapPin, Star } from "lucide-react";

// Shape returned by convex/bookmarks.ts mySpots.
interface MySpot {
  id: string;
  title: string;
  category: string;
  area: string | null;
  image: string | null;
  status: string;
  rejectReason: string | null;
  rating: number;
  reviewCount: number;
}

// "draft" is where an admin sends a submission back (see AdminHotspotsPage).
const STATUS: Record<string, { label: string; className: string; help: string }> = {
  published: {
    label: "Live",
    className: "bg-green-100 text-green-800",
    help: "Visible to everyone on Lagos Hotspot.",
  },
  pending: {
    label: "In review",
    className: "bg-amber-100 text-amber-800",
    help: "Our team checks every new spot before it goes live.",
  },
  draft: {
    label: "Not published",
    className: "bg-muted text-muted-foreground",
    help: "Our team didn't publish this spot.",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
    help: "No longer shown on Lagos Hotspot.",
  },
};

const TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "pending", label: "In review" },
];

function SpotCard({ spot }: { spot: MySpot }) {
  const { navigate } = useRouter();
  const status = STATUS[spot.status] ?? STATUS.draft;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <SpotPhoto
          src={spot.image}
          alt={spot.title}
          category={spot.category}
          className="w-full h-full"
          loading="lazy"
        />
        <Badge className={`absolute top-3 right-3 border-0 text-xs ${status.className}`}>
          {status.label}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{spot.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {[spot.area, spot.category].filter(Boolean).join(" · ")}
          {spot.reviewCount > 0 && (
            <>
              <span className="mx-0.5">·</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              {spot.rating}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {status.help}
          {spot.status === "draft" && spot.rejectReason ? ` Reason: ${spot.rejectReason}` : ""}
        </p>
        {spot.status === "published" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("hotspot", { id: spot.id })}
          >
            View spot
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardListings() {
  const { navigate } = useRouter();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");

  const spots = useQuery(api.bookmarks.mySpots, token ? { token } : "skip") as
    | MySpot[]
    | undefined;
  const filteredSpots =
    activeTab === "all" ? spots ?? [] : (spots ?? []).filter((s) => s.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-foreground">My spots</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Spots you&apos;ve submitted to Lagos Hotspot. To change a live spot, contact our
            team.
          </p>
        </div>
        <Button onClick={() => navigate("dashboard-add-spot")}>
          <Plus className="h-4 w-4 mr-2" />
          Add a spot
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {spots === undefined ? (
            <p className="text-sm text-muted-foreground py-6">Loading your spots…</p>
          ) : filteredSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-semibold text-foreground mb-1">
                  {spots.length === 0 ? "You haven't added a spot yet" : "Nothing here"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {spots.length === 0
                    ? "Know a place Lagos should hear about? Submit it and our team will take a look."
                    : "None of your spots are in this list right now."}
                </p>
                {spots.length === 0 && (
                  <Button onClick={() => navigate("dashboard-add-spot")}>Add a spot</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
