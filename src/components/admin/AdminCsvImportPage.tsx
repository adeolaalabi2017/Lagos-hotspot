"use client";

import { useState, useMemo } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Check, X } from "lucide-react";

interface PreviewRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: Record<string, string>;
}

const HEADERS = [
  "title",
  "description",
  "category",
  "area",
  "priceLevel",
  "phone",
  "whatsappNumber",
  "instagramHandle",
  "status",
  "isFeatured",
  "isVerified",
  "isTrending",
  "lat",
  "lng",
  "coverImageUrl",
  "tags",
];

export function AdminCsvImportPage() {
  const user = useAuthStore((s) => s.user);
  const [fileName, setFileName] = useState<string>("");
  const [csv, setCsv] = useState<string>("");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [committed, setCommitted] = useState<{
    success: number;
    failure: number;
  } | null>(null);

  const summary = useMemo(() => {
    if (!preview) return null;
    const total = preview.length;
    const valid = preview.filter(
      (r) => Object.keys(r.errors).length === 0
    ).length;
    return { total, valid, invalid: total - valid };
  }, [preview]);

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    setCsv(text);
    setPreview(null);
    setCommitted(null);
  }

  async function importNow() {
    if (!csv || !user) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/hotspots/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, csv }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "Import failed");
        return;
      }
      const data = (await res.json()) as {
        preview: PreviewRow[];
        successCount: number;
        failureCount: number;
      };
      setPreview(data.preview);
      setCommitted({
        success: data.successCount,
        failure: data.failureCount,
      });
      toast.success(
        `Imported ${data.successCount} hotspot${data.successCount === 1 ? "" : "s"} (${data.failureCount} skipped)`
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <AdminGuard>
      <AdminLayout
        current="admin-import"
        title="CSV import"
        description="Upload a CSV to seed Lagos hotspots in bulk. Rows with required fields will land as Draft — review and publish them in the Hotspots list."
      >
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                File
              </h2>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                  aria-label="Choose CSV"
                />
                <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted motion-safe:transition-colors">
                  <Upload className="h-4 w-4" />
                  {fileName ? (
                    <span className="text-foreground">{fileName}</span>
                  ) : (
                    "Click to choose a CSV file"
                  )}
                </div>
              </label>
            </div>

            {fileName ? (
              <div className="rounded-md bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Required headers
                  </h3>
                </div>
                <code className="block text-xs text-muted-foreground break-words">
                  {HEADERS.join(", ")}
                </code>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                disabled={!csv || importing}
                onClick={importNow}
              >
                {importing ? "Importing…" : "Parse and import"}
              </Button>
              {fileName ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCsv("");
                    setFileName("");
                    setPreview(null);
                    setCommitted(null);
                  }}
                >
                  Reset
                </Button>
              ) : null}
              {committed ? (
                <p className="text-xs text-muted-foreground ml-auto">
                  Last import: {committed.success} succeeded,{" "}
                  {committed.failure} skipped
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {preview && summary ? (
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b text-sm">
              <span className="font-medium">
                Preview · {summary.valid} valid / {summary.invalid} invalid
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Row</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Area</th>
                    <th className="text-left px-4 py-3 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row) => {
                    const invalid = Object.keys(row.errors).length > 0;
                    return (
                      <tr
                        key={row.rowIndex}
                        className={
                          invalid
                            ? "border-t bg-destructive/5"
                            : "border-t bg-emerald-50/40"
                        }
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          #{row.rowIndex}
                        </td>
                        <td className="px-4 py-3">
                          {invalid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive text-xs font-medium px-2 py-0.5">
                              <X className="h-3 w-3" />
                              Invalid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5">
                              <Check className="h-3 w-3" />
                              Valid
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              row.errors.title
                                ? "text-destructive"
                                : "font-medium"
                            }
                          >
                            {row.data.title || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.data.category || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.data.area || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {Object.entries(row.errors)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ") || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </AdminLayout>
    </AdminGuard>
  );
}
