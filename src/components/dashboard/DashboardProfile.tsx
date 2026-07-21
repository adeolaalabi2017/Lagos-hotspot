"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_LABELS, TIER_BG_COLORS, TIER_FEATURES } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Save,
  Flame,
  MapPin,
  Bell,
  Shield,
  Zap,
  Palette,
  Upload,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const lagosAreas = [
  "Victoria Island",
  "Ikoyi",
  "Lekki",
  "Yaba",
  "Surulere",
  "Ikeja",
  "Lagos Island",
  "Ajah",
  "Apapa",
  "Ikorodu",
];

export default function DashboardProfile() {
  const { user } = useAuthStore();
  const { navigate } = useRouter();
  const userTier = user?.tier || "explorer";
  const tierFeatures = TIER_FEATURES[userTier];
  const isAmbassador = userTier === "ambassador";

  const [formData, setFormData] = useState({
    name: user?.name || "Tunde Bakare",
    email: user?.email || "tunde@ekospot.com",
    bio: "Lagos explorer, foodie, and nightlife enthusiast. Always on the hunt for the next great spot in the city!",
    location: "Victoria Island",
  });

  // Trending Alerts toggle (visual only)
  const [trendingAlertsEnabled, setTrendingAlertsEnabled] = useState(true);

  // Custom Branding state
  const [brandColor, setBrandColor] = useState("#E8613C");
  const [tagline, setTagline] = useState("The best dining experience in Victoria Island");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = () => {
    toast.info("Logo upload coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile information and account settings.
        </p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {user?.avatar || "ES"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-white shadow-sm hover:bg-primary/90 transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {formData.name}
              </h2>
              <p className="text-muted-foreground text-sm">{formData.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", TIER_BG_COLORS[userTier])}
                >
                  <Flame className="h-3 w-3 mr-1" />
                  {TIER_LABELS[userTier]}
                </Badge>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <MapPin className="h-3 w-3" />
                  {formData.location}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location (Lagos Area)</Label>
              <Select
                value={formData.location}
                onValueChange={(v) => handleChange("location", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {lagosAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Current Tier</Label>
              <Input
                id="tier"
                value={TIER_LABELS[userTier]}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself and what you love about Lagos..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates about spots, reviews, and messages</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Notification settings coming soon!")}>
              Configure
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Trending Alerts</p>
                  {tierFeatures.trendingAlerts ? (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                      Scout+
                    </Badge>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Get notified when hotspots near you start trending</p>
              </div>
            </div>
            {tierFeatures.trendingAlerts ? (
              <Switch
                checked={trendingAlertsEnabled}
                onCheckedChange={setTrendingAlertsEnabled}
              />
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
                Upgrade to Scout
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Password change coming soon!")}>
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Subscription Plan</p>
                <p className="text-xs text-muted-foreground">
                  Currently on {TIER_LABELS[userTier]} tier
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Subscription management coming soon!")}>
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Branding (Ambassador only) */}
      <Card className={isAmbassador ? "border-amber-200" : "border-muted opacity-75"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Custom Branding</CardTitle>
              {isAmbassador ? (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                  Ambassador
                </Badge>
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isAmbassador && (
              <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
                Upgrade to Ambassador
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAmbassador ? (
            <div className="space-y-5">
              <p className="text-xs text-muted-foreground">
                Customize how your spot appears to visitors on EkoSpot.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Color */}
                <div className="space-y-2">
                  <Label htmlFor="brandColor">Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg border border-border shrink-0"
                      style={{ backgroundColor: brandColor }}
                    />
                    <Input
                      id="brandColor"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#E8613C"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={handleLogoUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A catchy tagline for your spot..."
                />
              </div>

              {/* Preview Card */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="overflow-hidden max-w-sm">
                  <div
                    className="h-20 flex items-center justify-center"
                    style={{ backgroundColor: brandColor }}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span className="text-white text-lg font-bold">{formData.name?.charAt(0) || "E"}</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm">Your Spot Name</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tagline || "Your tagline here..."}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {formData.location}
                    </div>
                    <Badge
                      className="mt-2 text-[10px] border-0 text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Ambassador Partner
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Upgrade to Ambassador to customize your spot branding
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="min-w-[140px]" onClick={() => toast.success("Profile updated successfully!")}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
