"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImagePlus, X, Save } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { HoursEditor, defaultHours, type HourRow } from "./HoursEditor";

export type HotspotFormValues = {
  title: string;
  description: string;
  category: string;
  area: string;
  priceLevel: "" | "1" | "2" | "3" | "4";
  phone: string;
  whatsappNumber: string;
  instagramHandle: string;
  coverImageUrl: string;
  galleryUrls: string[];
  tags: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isVerified: boolean;
  isTrending: boolean;
  lat: string;
  lng: string;
  hours: HourRow[];
};

const CATEGORIES = [
  { id: "Food & Dining", label: "Food & Dining" },
  { id: "Nightlife", label: "Nightlife" },
  { id: "Beaches & Resorts", label: "Beaches & Resorts" },
  { id: "Culture & Arts", label: "Culture & Arts" },
  { id: "Cafes & Hangouts", label: "Cafes & Hangouts" },
  { id: "Shopping", label: "Shopping" },
  { id: "Wellness & Spa", label: "Wellness & Spa" },
];

const AREAS = [
  "Victoria Island",
  "Ikoyi",
  "Lekki",
  "Yaba",
  "Surulere",
  "Ikeja",
  "Ajah",
  "Maryland",
];

const EMPTY_VALUES: HotspotFormValues = {
  title: "",
  description: "",
  category: CATEGORIES[0].id,
  area: AREAS[0],
  priceLevel: "",
  phone: "",
  whatsappNumber: "",
  instagramHandle: "",
  coverImageUrl: "",
  galleryUrls: [],
  tags: "",
  status: "draft",
  isFeatured: false,
  isVerified: false,
  isTrending: false,
  lat: "",
  lng: "",
  hours: defaultHours(),
};

export function AdminHotspotForm({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: HotspotFormValues | null;
  onSubmit: (values: HotspotFormValues) => Promise<void> | void;
}) {
  const user = useAuthStore((s) => s.user);
  const [values, setValues] = useState<HotspotFormValues>(
    initialValues ?? EMPTY_VALUES
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  function patch<K extends keyof HotspotFormValues>(
    key: K,
    value: HotspotFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!values.category) {
      toast.error("Category is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpload(file: File, kind: "cover" | "gallery") {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5 MB per image");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Upload failed");
        return;
      }
      const data = (await res.json()) as { url: string };
      if (kind === "cover") {
        patch("coverImageUrl", data.url);
      } else {
        patch("galleryUrls", [...values.galleryUrls, data.url]);
      }
      toast.success("Uploaded");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="font-display text-xl tracking-tight">
            {initialValues ? "Edit hotspot" : "New hotspot"}
          </SheetTitle>
          <SheetDescription>
            New rows save as Draft. Toggle status to Published when ready.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm">
          <Section title="Identity">
            <Field label="Title" required>
              <Input
                value={values.title}
                onChange={(e) => patch("title", e.target.value)}
                placeholder="e.g. Nok by Alara"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={values.description}
                onChange={(e) => patch("description", e.target.value)}
                rows={3}
                placeholder="What makes this spot worth a visit?"
              />
            </Field>
          </Section>

          <Section title="Categorisation">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" required>
                <select
                  value={values.category}
                  onChange={(e) => patch("category", e.target.value)}
                  className="h-9 w-full rounded-md border bg-card px-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Area">
                <select
                  value={values.area}
                  onChange={(e) => patch("area", e.target.value)}
                  className="h-9 w-full rounded-md border bg-card px-2 text-sm"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Price level">
                <select
                  value={values.priceLevel}
                  onChange={(e) =>
                    patch(
                      "priceLevel",
                      e.target.value as HotspotFormValues["priceLevel"]
                    )
                  }
                  className="h-9 w-full rounded-md border bg-card px-2 text-sm"
                >
                  <option value="">—</option>
                  <option value="1">$ — Budget</option>
                  <option value="2">$$ — Moderate</option>
                  <option value="3">$$$ — Premium</option>
                  <option value="4">$$$$ — Luxury</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Phone">
                <Input
                  value={values.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+234 …"
                />
              </Field>
              <Field label="WhatsApp">
                <Input
                  value={values.whatsappNumber}
                  onChange={(e) => patch("whatsappNumber", e.target.value)}
                  placeholder="+234 …"
                />
              </Field>
              <Field label="Instagram">
                <Input
                  value={values.instagramHandle}
                  onChange={(e) => patch("instagramHandle", e.target.value)}
                  placeholder="@handle"
                />
              </Field>
            </div>
          </Section>

          <Section title="Imagery">
            <Field label="Cover image">
              {values.coverImageUrl ? (
                <div className="relative">
                  <img
                    src={values.coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => patch("coverImageUrl", "")}
                    className="absolute top-2 right-2 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80 motion-safe:transition-colors"
                    aria-label="Remove cover image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <UploadDropzone
                  kind="cover"
                  disabled={uploading}
                  onFile={(f) => handleUpload(f, "cover")}
                />
              )}
            </Field>
            <Field label="Gallery">
              {values.galleryUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {values.galleryUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch(
                            "galleryUrls",
                            values.galleryUrls.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 hover:bg-black/80 motion-safe:transition-colors"
                        aria-label={`Remove gallery image ${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <UploadDropzone
                kind="gallery"
                disabled={uploading}
                onFile={(f) => handleUpload(f, "gallery")}
              />
              {uploading ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading…
                </p>
              ) : null}
            </Field>
          </Section>

          <Section title="Discovery">
            <Field label="Tags (comma-separated)">
              <Input
                value={values.tags}
                onChange={(e) => patch("tags", e.target.value)}
                placeholder="brunch, live music, vegan"
              />
              {values.tags ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {values.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                </div>
              ) : null}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <Input
                  type="number"
                  step="0.0001"
                  value={values.lat}
                  onChange={(e) => patch("lat", e.target.value)}
                  placeholder="6.4281"
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="0.0001"
                  value={values.lng}
                  onChange={(e) => patch("lng", e.target.value)}
                  placeholder="3.4219"
                />
              </Field>
            </div>
          </Section>

          <Section title="Hours">
            <HoursEditor
              value={values.hours}
              onChange={(rows) => patch("hours", rows)}
            />
          </Section>

          <Section title="Status & flags">
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase text-muted-foreground tracking-wider">
                Publication
              </Label>
              <div role="radiogroup" className="flex gap-2">
                {(["draft", "published", "archived"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={values.status === s}
                    onClick={() => patch("status", s)}
                    className={
                      values.status === s
                        ? "rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5"
                        : "rounded-full border text-xs font-medium px-3 py-1.5 hover:bg-muted motion-safe:transition-colors"
                    }
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {(
                [
                  ["isFeatured", "Featured"],
                  ["isVerified", "Verified"],
                  ["isTrending", "Trending"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={values[key]}
                    onChange={(e) => patch(key, e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>
        </div>

        <footer className="border-t px-6 py-4 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            <Save className="h-4 w-4 mr-1" />
            {submitting ? "Saving…" : "Save"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} {required ? <span className="text-primary">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function UploadDropzone({
  kind,
  disabled,
  onFile,
}: {
  kind: "cover" | "gallery";
  disabled?: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label
      className={
        disabled
          ? "block cursor-not-allowed"
          : "block cursor-pointer"
      }
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        multiple={kind === "gallery"}
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) onFile(file);
          }
          e.target.value = "";
        }}
        className="sr-only"
        aria-label={
          kind === "cover" ? "Upload cover image" : "Upload gallery images"
        }
      />
      <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-4 text-xs text-muted-foreground hover:bg-muted motion-safe:transition-colors">
        <ImagePlus className="h-4 w-4" />
        Click to upload {kind === "cover" ? "cover image" : "gallery images"}
        <span className="text-[10px] ml-1">(jpeg / png / webp, ≤5 MB)</span>
      </div>
    </label>
  );
}
