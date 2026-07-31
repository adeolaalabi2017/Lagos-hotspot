"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "@/lib/router";
import { faqItems } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageHero from "@/components/layout/PageHero";

export default function FAQPage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Group FAQ items by category
  const categories = useMemo(() => {
    const cats = [...new Set(faqItems.map((item) => item.category))];
    return ["All", ...cats];
  }, []);

  const filteredFaqItems = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof faqItems> = {};
    filteredFaqItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredFaqItems]);

  return (
    <div>
      {/* Hero */}
      <PageHero title="Frequently Asked Questions" subtitle="Find answers to common questions about Lagos Hotspot." variant="light" />

      {/* FAQ Accordion */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4">
          {/* Search Input */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
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

          {filteredFaqItems.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    {category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-3">
                    {items.map((item, idx) => (
                      <AccordionItem
                        key={`${category}-${idx}`}
                        value={`${category}-${idx}`}
                        className="bg-white border rounded-lg px-6 data-[state=open]:shadow-md"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium pr-4">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No results found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching for a different topic
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you with anything you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => navigate("contact-us")}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => navigate("help-center")}>
              Visit Help Center
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
