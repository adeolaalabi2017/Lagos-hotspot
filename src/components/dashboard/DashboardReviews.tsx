"use client";

import React from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/convex-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";

// Shape returned by convex/bookmarks.ts myReviews.
interface MyReview {
  id: string;
  listingId: string;
  listingTitle: string | null;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; className: string; help: string }> = {
  approved: {
    label: "Published",
    className: "bg-green-100 text-green-800",
    help: "Visible on the spot's page.",
  },
  pending: {
    label: "In review",
    className: "bg-amber-100 text-amber-800",
    help: "Our team checks every review before it appears.",
  },
  hidden: {
    label: "Hidden",
    className: "bg-muted text-muted-foreground",
    help: "Removed by our team for breaking the review rules.",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

export default function DashboardReviews() {
  const { navigate } = useRouter();
  const { token } = useAuthStore();
  const reviews = useQuery(api.bookmarks.myReviews, token ? { token } : "skip") as
    | MyReview[]
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reviews you&apos;ve written. To write one, open a spot and go to its Reviews tab.
        </p>
      </div>

      {reviews === undefined ? (
        <p className="text-sm text-muted-foreground py-6">Loading your reviews…</p>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-semibold text-foreground mb-1">No reviews yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Been somewhere good lately? Tell other Lagosians about it.
            </p>
            <Button onClick={() => navigate("explore")}>Explore spots</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = STATUS[review.status] ?? STATUS.pending;
            return (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-foreground text-sm">
                        {review.listingTitle ?? "A spot that's no longer listed"}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge className={`border-0 text-xs self-start ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{status.help}</p>
                    {review.listingTitle && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("hotspot", { id: review.listingId })}
                      >
                        View spot
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
