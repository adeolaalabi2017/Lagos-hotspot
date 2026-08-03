"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/convex-api";
import { categories } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  ImagePlus,
  Send,
  Tag,
  Info,
  Phone,
  Instagram,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

const lagosNeighborhoods = [
  "Victoria Island",
  "Ikoyi",
  "Lekki",
  "Yaba",
  "Surulere",
  "Ikeja",
];

const priceLevels = [
  { value: "1", label: "Budget" },
  { value: "2", label: "Moderate" },
  { value: "3", label: "Premium" },
  { value: "4", label: "Luxury" },
];

export default function DashboardAddListing() {
  const { navigate } = useRouter();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    spotName: "",
    category: "",
    area: "",
    description: "",
    priceLevel: "",
    phoneNumber: "",
    whatsappNumber: "",
    instagramHandle: "",
    tags: "",
    features: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const submitListing = useMutation((api as any).hotspots.submitListing);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.spotName || !formData.category || !formData.area) {
      toast.error("Please fill in all required fields (Spot Name, Category, Area)");
      return;
    }
    setSubmitting(true);
    try {
      await submitListing({
        ...formData,
        authorId: user?.id,
        authorEmail: user?.email,
        authorName: user?.name,
      });
      toast.success("Spot submitted for review! We'll review it within 24-48 hours.");
      navigate("dashboard-my-spots");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit spot";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Spot</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit a new hotspot to Lagos Hotspot and help the Lagos community discover great places.
          </p>
        </div>
      </div>

      {/* Section 1: General Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />
            General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="spotName">Spot Name *</Label>
            <Input
              id="spotName"
              placeholder="e.g. Yellow Chilli"
              value={formData.spotName}
              onChange={(e) => handleChange("spotName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area *</Label>
              <Select
                value={formData.area}
                onValueChange={(v) => handleChange("area", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  {lagosNeighborhoods.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe what makes this spot special..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Price Level</Label>
            <Select
              value={formData.priceLevel}
              onValueChange={(v) => handleChange("priceLevel", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select price level" />
              </SelectTrigger>
              <SelectContent>
                {priceLevels.map((pl) => (
                  <SelectItem key={pl.value} value={pl.value}>
                    {pl.label} ({"₦".repeat(Number(pl.value))})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImagePlus className="h-5 w-5 text-primary" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Drag & drop your spot photos here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                <ImagePlus className="h-4 w-4 mr-2" />
                Choose Images
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB each. Max 10 images.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                placeholder="+234 801 234 5678"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                placeholder="+234 801 234 5678"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramHandle" className="flex items-center gap-1.5">
              <Instagram className="h-3.5 w-3.5" />
              Instagram Handle
            </Label>
            <Input
              id="instagramHandle"
              placeholder="@your_spot_handle"
              value={formData.instagramHandle}
              onChange={(e) => handleChange("instagramHandle", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Tags & Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            Tags & Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g. Fine Dining, Date Night, Outdoor Seating"
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Separate tags with commas
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Input
              id="features"
              placeholder="e.g. Wi-Fi, Parking, Air Conditioning, Live Music"
              value={formData.features}
              onChange={(e) => handleChange("features", e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Separate features with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          variant="outline"
          className="sm:w-auto w-full"
          onClick={() => navigate("dashboard")}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          className="sm:w-auto w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? "Submitting..." : "Submit Spot"}
        </Button>
      </div>
    </div>
  );
}
