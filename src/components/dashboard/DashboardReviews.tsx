"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { reviews } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MessageSquare, Pencil, Send, Lock } from "lucide-react";
import { toast } from "sonner";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// Reply type for owner responses
interface ReviewReply {
  text: string;
  timestamp: string;
}

function ReviewCardWithReply({
  review,
  isAmbassador,
  reply,
  onReplyChange,
  onSendReply,
  replyingTo,
  onToggleReply,
}: {
  review: typeof reviews[0];
  isAmbassador: boolean;
  reply: Record<string, string>;
  onReplyChange: (id: string, text: string) => void;
  onSendReply: (id: string) => void;
  replyingTo: string | null;
  onToggleReply: (id: string) => void;
}) {
  const [localReplies, setLocalReplies] = useState<Record<string, ReviewReply>>({});
  const isReplying = replyingTo === review.id;
  const replyText = reply[review.id] || "";
  const existingReply = localReplies[review.id];

  const handleSend = () => {
    if (!replyText.trim()) return;
    setLocalReplies((prev) => ({
      ...prev,
      [review.id]: { text: replyText.trim(), timestamp: "Just now" },
    }));
    onSendReply(review.id);
    toast.success("Reply posted successfully!");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {review.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    {review.user}
                  </h3>
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-primary font-medium">
                  {review.hotspotTitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {review.date}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {review.comment}
            </p>

            {/* Owner Response */}
            {existingReply && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      O
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                    Owner Response
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">{existingReply.timestamp}</span>
                </div>
                <p className="text-sm text-foreground">{existingReply.text}</p>
              </div>
            )}

            {/* Reply Actions */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* navigate to hotspot */}}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                View Spot
              </Button>
              {isAmbassador && !existingReply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleReply(review.id)}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Reply
                </Button>
              )}
            </div>

            {/* Inline Reply Input */}
            {isReplying && (
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => onReplyChange(review.id, e.target.value)}
                  placeholder="Write your response..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && replyText.trim()) {
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardReviews() {
  const { navigate } = useRouter();
  const { user } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const isAmbassador = TIER_FEATURES[userTier].respondToReviews;

  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / reviews.length) *
              100
          )
        : 0,
  }));

  const handleReplyChange = (id: string, text: string) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = (id: string) => {
    setReplyTexts((prev) => ({ ...prev, [id]: "" }));
    setReplyingTo(null);
  };

  const handleToggleReply = (id: string) => {
    setReplyingTo(replyingTo === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reviews you&apos;ve written for Lagos hotspots.
          </p>
        </div>
        <Button onClick={() => toast.info("Write a review from any hotspot page!")}>
          <Pencil className="h-4 w-4 mr-2" />
          Write New Review
        </Button>
      </div>

      {/* Ambassador Reply Note */}
      {!isAmbassador && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Respond to Reviews</span> is available for Ambassador tier. Upgrade to reply to customer reviews.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("pricing")}>
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="text-5xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-muted-foreground mt-1">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-24" />
            <Separator className="sm:hidden" />
            <div className="flex-1 w-full space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.star} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6 text-right">
                    {item.star}
                  </span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCardWithReply
            key={review.id}
            review={review}
            isAmbassador={isAmbassador}
            reply={replyTexts}
            onReplyChange={handleReplyChange}
            onSendReply={handleSendReply}
            replyingTo={replyingTo}
            onToggleReply={handleToggleReply}
          />
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">
                No reviews yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visit some hotspots and share your experience with the community!
              </p>
              <Button onClick={() => navigate("explore")}>
                Explore Spots
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
