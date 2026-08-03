"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface WriteReviewFormProps {
  hotspotId: string;
  onSubmitted?: () => void;
}

export function WriteReviewForm({
  hotspotId,
  onSubmitted,
}: WriteReviewFormProps) {
  const { navigate } = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUser = user!;
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitReview = useMutation((api as any).hotspots.submitReview);

  if (!user) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to share your experience.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => navigate("login")}
        >
          Sign in
        </Button>
      </div>
    );
  }

  if (user.suspendedAt) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">
          Your account is currently suspended and cannot post reviews.
        </p>
      </div>
    );
  }

  async function submit() {
    if (rating < 1) {
      toast.error("Pick a star rating from 1 to 5");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        listingId: hotspotId,
        rating,
        comment: comment.trim() || undefined,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
      });
      toast.success("Review submitted. It's pending moderator approval.");
      setRating(0);
      setComment("");
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-foreground">Write a review</h3>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Your rating"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={
                value <= (hover || rating)
                  ? "h-6 w-6 fill-amber-400 text-amber-400 motion-safe:transition-colors"
                  : "h-6 w-6 text-muted-foreground/40 motion-safe:transition-colors"
              }
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating ? `${rating}.0` : "Pick a rating"}
        </span>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tell other Lagosians what to expect"
        maxLength={1000}
        aria-label="Your review comment"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {comment.length}/1000 characters
        </span>
        <Button onClick={submit} disabled={submitting || rating < 1}>
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
      </div>
    </div>
  );
}
