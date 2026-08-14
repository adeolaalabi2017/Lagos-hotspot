"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { AdminGuard } from "./AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BRAND_ASSETS = [
  { key: "logo", label: "Brand Logo", description: "Used in navbar and footer", accept: "image/png,image/svg+xml,image/webp" },
  { key: "favicon", label: "Favicon", description: "Browser tab icon (PNG, ICO)", accept: "image/png,image/x-icon,image/svg+xml" },
  { key: "hero", label: "Hero Image", description: "Homepage hero background", accept: "image/png,image/jpeg,image/webp" },
];

export default function AdminSettingsPage() {
  const { navigate } = useRouter();
  const user = useAuthStore((s) => s.user);
  const generateUploadUrl = useMutation(api.brand.generateUploadUrl);
  const setBrandAsset = useMutation(api.brand.setBrandAsset);
  const deleteBrandAsset = useMutation(api.brand.deleteBrandAsset);

  const [uploading, setUploading] = useState<string | null>(null);

  if (!user || user.role !== "admin") {
    return <AdminGuard><div /></AdminGuard>;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }

    setUploading(key);
    try {
      const uploadUrl = await generateUploadUrl();

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { storageId } = await res.json();

      await setBrandAsset({
        key,
        storageId,
        alt: `${key} image`,
      });

      toast.success(`${key} updated successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to upload ${key}`);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete ${key}? This will revert to the default.`)) return;
    try {
      await deleteBrandAsset({ key });
      toast.success(`${key} deleted`);
    } catch {
      toast.error(`Failed to delete ${key}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Settings</h1>
          <p className="text-muted-foreground text-sm">Manage logo, favicon, and hero image</p>
        </div>
      </div>

      <div className="grid gap-6">
        {BRAND_ASSETS.map((asset) => (
          <Card key={asset.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{asset.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{asset.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">Upload:</Label>
                <Input
                  type="file"
                  accept={asset.accept}
                  onChange={(e) => handleUpload(e, asset.key)}
                  disabled={uploading === asset.key}
                  className="max-w-sm"
                />
                {uploading === asset.key && (
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium w-20">Actions:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(asset.key)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Files are stored in Convex and served via /api/brand/[key].</p>
        <p>Max file size: 5MB. Recommended: Logo (PNG/SVG), Favicon (PNG), Hero (1536×1024).</p>
      </div>
    </div>
  );
}
