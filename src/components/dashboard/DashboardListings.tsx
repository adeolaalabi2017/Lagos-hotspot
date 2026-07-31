"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, MapPin, Pencil, Trash2, Star, Flame, Lock } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

type SpotStatus = "Active" | "Pending";

interface MySpot {
  id: string;
  title: string;
  area: string;
  category: string;
  image: string;
  status: SpotStatus;
  rating: number;
  vibeScore: number;
}

const mySpots: MySpot[] = [
  { id: "1", title: "Yellow Chilli", area: "Victoria Island", category: "Food & Dining", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", status: "Active", rating: 4.8, vibeScore: 92 },
  { id: "2", title: "Bogobiri House", area: "Ikoyi", category: "Culture & Arts", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop", status: "Active", rating: 4.6, vibeScore: 85 },
  { id: "3", title: "Terra Kulture", area: "Victoria Island", category: "Culture & Arts", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=300&fit=crop", status: "Pending", rating: 0, vibeScore: 0 },
];

function SpotCard({ spot, isAmbassador, featuredSpots, toggleFeatured }: {
  spot: MySpot;
  isAmbassador: boolean;
  featuredSpots: Record<string, boolean>;
  toggleFeatured: (id: string) => void;
}) {
  const { navigate } = useRouter();
  const isFeatured = featuredSpots[spot.id] || false;

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow group ${isFeatured ? "ring-2 ring-amber-400/50" : ""}`}>
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {spot.image && (
          <img
            src={spot.image}
            alt={spot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <Badge
          variant="outline"
          className={`absolute top-3 right-3 ${getStatusColor(spot.status)}`}
        >
          {spot.status}
        </Badge>
        {isFeatured && (
          <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-[10px] flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
          {spot.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          {spot.area}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="text-primary font-medium">{spot.category}</span>
          {spot.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {spot.rating}
            </div>
          )}
          {spot.vibeScore > 0 && (
            <div className="flex items-center gap-0.5">
              <Flame className="h-3 w-3 text-primary" />
              {spot.vibeScore}
            </div>
          )}
        </div>
        {/* Featured Toggle (Ambassador only) */}
        {isAmbassador && spot.status === "Active" && (
          <div className="flex items-center justify-between py-2 mb-2 border-t border-b">
            <div className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${isFeatured ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium text-foreground">Featured</span>
            </div>
            <Switch
              checked={isFeatured}
              onCheckedChange={() => toggleFeatured(spot.id)}
            />
          </div>
        )}
        {isAmbassador && !isFeatured && spot.status === "Active" && (
          <p className="text-[10px] text-muted-foreground mb-2">
            Featured spots appear at the top of search results
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("dashboard-add-spot", { editId: spot.id })}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`"${spot.title}" has been deleted`);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("hotspot", { hotspotId: spot.id })}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardListings() {
  const { navigate } = useRouter();
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const isAmbassador = TIER_FEATURES[userTier].featuredPlacement;

  const [activeTab, setActiveTab] = useState("all");
  const [featuredSpots, setFeaturedSpots] = useState<Record<string, boolean>>({});

  const toggleFeatured = (id: string) => {
    setFeaturedSpots((prev) => {
      const newFeatured = !prev[id];
      if (newFeatured) {
        toast.success("Spot is now featured! It will appear at the top of search results.");
      } else {
        toast.info("Spot removed from featured placement.");
      }
      return { ...prev, [id]: newFeatured };
    });
  };

  const filteredSpots =
    activeTab === "all"
      ? mySpots
      : mySpots.filter((s) => s.status.toLowerCase() === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Spots</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the hotspots you&apos;ve submitted to Lagos Hotspot.
          </p>
        </div>
        <Button onClick={() => navigate("dashboard-add-spot")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Spot
        </Button>
      </div>

      {/* Ambassador Feature Note */}
      {!isAmbassador && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Featured Placement</span> is available for Ambassador tier. Upgrade to feature your spots at the top of search results.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  isAmbassador={isAmbassador}
                  featuredSpots={featuredSpots}
                  toggleFeatured={toggleFeatured}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">
                  No spots found
                </h3>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any {activeTab} spots yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
