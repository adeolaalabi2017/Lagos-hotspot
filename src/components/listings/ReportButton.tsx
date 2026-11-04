"use client";

import { useId, useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/lib/convex-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Labels match CATEGORY_LABEL in AdminReportsPage.
const REASONS = [
  { id: "spam", label: "Spam", hint: "Ads, links or repeated posts" },
  { id: "fake", label: "Fake or misleading", hint: "Wrong details, closed spot, made-up review" },
  { id: "harassment", label: "Harassment", hint: "Abuse, hate or threats" },
  { id: "other", label: "Something else", hint: "Tell us below" },
] as const;

type ReasonId = (typeof REASONS)[number]["id"];

type Target = { hotspotId: string } | { reviewId: string };

interface ReportButtonProps {
  target: Target;
  /** Shown in the dialog title, e.g. the spot's name or "this review". */
  subject: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** Icon-only trigger, for tight spots like review cards. */
  iconOnly?: boolean;
}

export function ReportButton({
  target,
  subject,
  variant = "outline",
  size = "default",
  className,
  iconOnly = false,
}: ReportButtonProps) {
  const { navigate } = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const submitReport = useMutation((api as any).hotspots.submitReport);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReasonId | "">("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Several report buttons can be on one page; keep field ids unique.
  const idPrefix = useId();

  const trigger = (
    <Button
      variant={variant}
      size={iconOnly ? "icon" : size}
      className={className}
      aria-label={iconOnly ? `Report ${subject}` : undefined}
      onClick={isAuthenticated ? undefined : () => navigate("login")}
    >
      <Flag className={iconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
      {!iconOnly && "Report"}
    </Button>
  );

  if (!isAuthenticated) return trigger;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setSubmitting(true);
    try {
      await submitReport({
        token: token ?? "",
        category,
        reason: reason.trim() || undefined,
        ...target,
      });
      toast.success("Thanks — we'll review it soon.");
      setOpen(false);
      setCategory("");
      setReason("");
    } catch (err) {
      toast.error(err instanceof ConvexError ? String(err.data) : "Could not send report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {subject}</DialogTitle>
          <DialogDescription>
            Reports are private. Our team checks each one and removes anything
            that breaks the rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <RadioGroup
            value={category}
            onValueChange={(v) => setCategory(v as ReasonId)}
            aria-label="What's wrong?"
            className="gap-2"
          >
            {REASONS.map((r) => (
              <Label
                key={r.id}
                htmlFor={`${idPrefix}-${r.id}`}
                className="flex items-start gap-3 rounded-lg border p-3 font-normal cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 motion-safe:transition-colors"
              >
                <RadioGroupItem id={`${idPrefix}-${r.id}`} value={r.id} className="mt-0.5" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-details`} className="text-sm">
              Details <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id={`${idPrefix}-details`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What should we know?"
            />
            <div className="text-xs text-muted-foreground text-right tabular-nums">
              {reason.length}/500
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !category}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
