"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, TIER_FEATURES } from "@/lib/auth-store";
import { helpArticles } from "@/data/mock-data";
import {
  Search,
  Star,
  Flame,
  Plus,
  Heart,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHero from "@/components/layout/PageHero";

const iconMap: Record<string, React.ElementType> = {
  Search,
  Star,
  Flame,
  Plus,
  Heart,
  MessageCircle,
};

const popularTopics = [
  {
    icon: Search,
    title: "Getting Started",
    description: "Learn how to find hotspots, search, and navigate Lagos Hotspot",
    color: "bg-green-100 text-green-700",
    category: "Getting Started",
  },
  {
    icon: Star,
    title: "Community",
    description: "Writing reviews, earning badges, and contributing to Lagos Hotspot",
    color: "bg-amber-100 text-amber-700",
    category: "Community",
  },
  {
    icon: Flame,
    title: "Features",
    description: "Vibe scores, saved spots, WhatsApp integration, and more",
    color: "bg-rose-100 text-rose-700",
    category: "Features",
  },
  {
    icon: MessageCircle,
    title: "Contact & Support",
    description: "Get help from our team via WhatsApp, email, or phone",
    color: "bg-teal-100 text-teal-700",
    category: "Support",
  },
];

export default function HelpCenterPage() {
  const { navigate } = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const tierFeatures = TIER_FEATURES[userTier];
  const listBusiness = isAuthenticated && tierFeatures.listBusiness;

  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="Lagos Hotspot Help Center" subtitle="Find answers and get support for your Lagos Hotspot account.">
        <div className="mt-8 relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 text-base"
          />
        </div>
      </PageHero>

      {/* Popular Topics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Popular Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTopics.map((topic) => (
            <Card
              key={topic.title}
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => {
                const matchingArticle = helpArticles.find(a => a.category === topic.category);
                if (matchingArticle) {
                  navigate("help-article", { articleId: matchingArticle.id });
                } else {
                  navigate("help-article", { articleId: "1" });
                }
              }}
            >
              <CardContent className="pt-6 flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${topic.color}`}
                >
                  <topic.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {topic.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Help Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Help Articles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(searchQuery ? filteredArticles : helpArticles).map((article) => {
            const ArticleIcon = iconMap[article.icon] || Star;
            return (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate("help-article", { articleId: article.id })}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <ArticleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-primary font-medium mb-1">{article.category}</p>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Still Need Help?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Email our team and we&apos;ll get back to you.
          </p>
          <div className="max-w-xs mx-auto">
            <a href="mailto:hello@lagos-hotspot.com" className="block">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Email support</h3>
                  <p className="text-xs text-muted-foreground mt-1">hello@lagos-hotspot.com</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
