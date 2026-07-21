"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES, TIER_LABELS } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Users,
  MessageCircle,
  Star,
  Lock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

// ─── Mock analytics data ─────────────────────────────────
const overviewStats = [
  { label: "Total Views", value: "1,247", change: "+12%", icon: Eye },
  { label: "Profile Visits", value: "892", change: "+8%", icon: Users },
  { label: "WhatsApp Clicks", value: "156", change: "+23%", icon: MessageCircle },
  { label: "Review Count", value: "23", change: "+5%", icon: Star },
];

const weeklyViews = [
  { day: "Mon", views: 145 },
  { day: "Tue", views: 189 },
  { day: "Wed", views: 210 },
  { day: "Thu", views: 178 },
  { day: "Fri", views: 256 },
  { day: "Sat", views: 312 },
  { day: "Sun", views: 198 },
];

const topSpots = [
  { name: "Yellow Chilli", category: "Food & Dining", views: 423, clicks: 67, rating: 4.8 },
  { name: "Bogobiri House", category: "Culture & Arts", views: 312, clicks: 45, rating: 4.6 },
  { name: "Terra Kulture", category: "Culture & Arts", views: 278, clicks: 38, rating: 4.5 },
];

const reviewSummary = [
  { rating: 5, count: 12, percentage: 52 },
  { rating: 4, count: 7, percentage: 30 },
  { rating: 3, count: 3, percentage: 13 },
  { rating: 2, count: 1, percentage: 4 },
  { rating: 1, count: 0, percentage: 0 },
];

export default function DashboardAnalytics() {
  const { navigate } = useRouter();
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const tierFeatures = TIER_FEATURES[userTier];
  const isAmbassador = tierFeatures.analytics;

  const maxViews = Math.max(...weeklyViews.map((d) => d.views));

  if (!isAmbassador) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your spot performance and visitor insights.
          </p>
        </div>
        <Card className="border-muted">
          <CardContent className="p-12 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Ambassador Feature</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Analytics is available exclusively for Ambassador tier members. Upgrade to track your spot performance, visitor insights, and more.
            </p>
            <Button onClick={() => navigate("pricing")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade to Ambassador
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
              Ambassador
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Track your spot performance and visitor insights.
          </p>
        </div>
        <Button variant="outline" size="sm">
          Last 7 days
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          const IconComp = stat.icon;
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
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  <span className="text-xs text-muted-foreground ml-1">vs last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {weeklyViews.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">{day.views}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                  style={{ height: `${(day.views / maxViews) * 140}px` }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Spots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Spots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSpots.map((spot, index) => (
                <div key={spot.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{spot.name}</p>
                      <p className="text-xs text-muted-foreground">{spot.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{spot.views}</p>
                      <p className="text-muted-foreground">views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{spot.clicks}</p>
                      <p className="text-muted-foreground">clicks</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{spot.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">4.3</p>
                <div className="flex items-center gap-0.5 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">23 reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {reviewSummary.map((item) => (
                  <div key={item.rating} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-3 text-right">{item.rating}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
