"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Users, MessageCircle, Star, Lock, TrendingUp, ArrowUpRight } from "lucide-react";

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
  const isHotspotOwner = user?.tier === "hotspot";

  const maxViews = Math.max(...weeklyViews.map((d) => d.views));

  if (!isHotspotOwner) {
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Hotspot Owner Feature</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Analytics is available for hotspot owners. Register as a hotspot owner to track your spot performance.
            </p>
            <Button variant="outline" onClick={() => navigate("dashboard-profile")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Manage Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              Hotspot Owner
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
    </div>
  );
}
