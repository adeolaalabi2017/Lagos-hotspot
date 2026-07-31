"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { blogPosts } from "@/data/mock-data";
import { Search, Clock, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import PageHero from "@/components/layout/PageHero";

const categories = [
  "All",
  "Guides",
  "Nightlife",
  "Beaches",
  "Food",
  "Culture",
];

const tags = [
  "Hidden Gems",
  "Nightlife",
  "Lagos",
  "Beaches",
  "Suya",
  "Art",
  "Budget",
  "Victoria Island",
];

export default function BlogPage() {
  const { navigate } = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  const filteredPosts = otherPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const recentPosts = blogPosts.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="Lagos Hotspot Blog" subtitle="Stories, guides, and insider tips for exploring Lagos" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Post */}
            {featuredPost && (
              <Card
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => navigate("blog-detail", { postId: featuredPost.id })}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="h-56 sm:h-auto overflow-hidden">
                    {featuredPost.image && (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <CardContent className="flex flex-col justify-center py-6">
                    <Badge className="w-fit mb-3">{featuredPost.category}</Badge>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {featuredPost.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {featuredPost.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {featuredPost.date} · {featuredPost.readTime}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate("blog-detail", { postId: post.id })}
                >
                  <div className="h-48 overflow-hidden">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <Badge variant="secondary" className="mb-2">
                      {post.category}
                    </Badge>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {post.author}
                        </span>
                        <span>·</span>
                        <span>{post.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center justify-between w-full text-sm py-1.5 hover:text-primary transition-colors"
                      >
                        <span>{cat}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Recent Posts
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((post, i) => (
                    <React.Fragment key={post.id}>
                      <div className="flex gap-3 cursor-pointer group" onClick={() => navigate("blog-detail", { postId: post.id })}>
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.date}
                          </p>
                        </div>
                      </div>
                      {i < recentPosts.length - 1 && (
                        <Separator className="my-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
