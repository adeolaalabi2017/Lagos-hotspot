"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { helpArticles } from "@/data/mock-data";
import { toast } from "sonner";
import { ArrowLeft, ThumbsUp, ThumbsDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageHero from "@/components/layout/PageHero";

export default function HelpArticlePage() {
  const { navigate, params } = useRouter();
  const articleId = params.articleId;
  const article = helpArticles.find((a) => a.id === articleId);
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  if (!article) {
    return (
      <div>
        <PageHero title="Article Not Found" subtitle="The help article you're looking for doesn't exist." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Button variant="outline" onClick={() => navigate("help-center")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
        </div>
      </div>
    );
  }

  const relatedArticles = helpArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const handleFeedback = (type: "yes" | "no") => {
    setFeedbackGiven(type);
    if (type === "yes") {
      toast.success("Thanks for your feedback!");
    } else {
      toast.info("We're sorry this wasn't helpful. We'll work on improving it.");
    }
  };

  return (
    <div>
      <PageHero title="Help Center" subtitle="Lagos Hotspot support and resources" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("help-center")}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Help Center
        </Button>

        {/* Article */}
        <Badge variant="secondary" className="mb-4">
          {article.category}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-6">
          {article.title}
        </h1>

        <article className="space-y-4 mb-10">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {paragraph}
            </p>
          ))}
        </article>

        <Separator className="my-8" />

        {/* Was this helpful? */}
        <Card className="mb-10">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold text-foreground mb-4">
              Was this article helpful?
            </h3>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={feedbackGiven === "yes" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedback("yes")}
                disabled={feedbackGiven !== null}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Yes
              </Button>
              <Button
                variant={feedbackGiven === "no" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFeedback("no")}
                disabled={feedbackGiven !== null}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                No
              </Button>
            </div>
            {feedbackGiven && (
              <p className="text-sm text-muted-foreground mt-3">
                {feedbackGiven === "yes"
                  ? "Thank you for your feedback!"
                  : "We appreciate your feedback and will improve this article."}
              </p>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Related Articles */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">
            Related Articles
          </h2>
          <div className="space-y-3">
            {relatedArticles.map((relArticle) => (
              <Card
                key={relArticle.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => {
                  setFeedbackGiven(null);
                  navigate("help-article", { articleId: relArticle.id });
                }}
              >
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">
                      {relArticle.category}
                    </p>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {relArticle.title}
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">Still need help?</p>
          <Button variant="outline" onClick={() => navigate("contact-us")}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
