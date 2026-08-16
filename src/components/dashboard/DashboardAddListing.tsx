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

export interface HotspotImage {
  file: File;
  preview: string;
}

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
  const [images, setImages] = useState<HotspotImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitListing = useMutation((api as any).hotspots.submitListing);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remaining = 5 - images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    setUploading(true);
    
    try {
      const urls: string[] = [];
      for (const img of images) {
        // For now, convert to base64 data URL for demo
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img.file);
        });
        urls.push(base64);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.spotName || !formData.category || !formData.area) {
      toast.error("Please fill in all required fields (Spot Name, Category, Area)");
      return;
    }
    if (!formData.description) {
      toast.error("Please provide a description");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      await submitListing({
        ...formData,
        image: imageUrls[0] || "",
        images: imageUrls,
        authorId: user?.id,
        authorEmail: user?.email,
        authorName: user?.name,
      });
      toast.success("Spot submitted for review!");
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
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload up to 5 images (PNG, JPG, WebP). Max 5MB each.
            </p>
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
