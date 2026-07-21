"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { pricingPlans, faqItems } from "@/data/mock-data";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHero from "@/components/layout/PageHero";

const featureComparison = [
  { feature: "Saved Spots", explorer: "10", scout: "Unlimited", ambassador: "Unlimited" },
  { feature: "Browse Hotspots", explorer: true, scout: true, ambassador: true },
  { feature: "Read Reviews", explorer: true, scout: true, ambassador: true },
  { feature: "Search & Filter", explorer: true, scout: true, ambassador: true },
  { feature: "Personalized Recommendations", explorer: false, scout: true, ambassador: true },
  { feature: "Trending Alerts", explorer: false, scout: true, ambassador: true },
  { feature: "Early Access to New Spots", explorer: false, scout: true, ambassador: true },
  { feature: "List Your Business", explorer: false, scout: false, ambassador: true },
  { feature: "Analytics Dashboard", explorer: false, scout: false, ambassador: true },
  { feature: "Featured Placement 🏆", explorer: false, scout: false, ambassador: true },
  { feature: "Respond to Reviews", explorer: false, scout: false, ambassador: true },
  { feature: "WhatsApp Integration", explorer: false, scout: false, ambassador: true },
  { feature: "Custom Branding", explorer: false, scout: false, ambassador: true },
  { feature: "Dedicated Support", explorer: false, scout: false, ambassador: true },
];

const pricingFaq = [
  {
    question: "Is EkoSpot free to use?",
    answer: "Yes! The Explorer plan is completely free. You can browse hotspots, read reviews, and save up to 10 spots without paying anything. Upgrade to Scout or Ambassador for premium features.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your Scout or Ambassador subscription at any time from your dashboard. You'll continue to have access until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major Nigerian debit cards (Visa, Mastercard, Verve), bank transfers, and USSD codes through Paystack. All transactions are in Nigerian Naira (₦).",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! The Scout plan comes with a 7-day free trial. No credit card required to start — you'll only be charged after the trial ends.",
  },
  {
    question: "What's the difference between Scout and Ambassador?",
    answer: "Scout is for individuals who want premium discovery features like unlimited saves, recommendations, and trending alerts. Ambassador is for business owners who want to list their business, access analytics, and get featured placement on EkoSpot.",
  },
  {
    question: "Do you offer yearly discounts?",
    answer: "Yes! Switch to yearly billing and save 17%. You'll pay for 10 months and get 12 months of access.",
  },
];

export default function PricingPage() {
  const { navigate } = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: (typeof pricingPlans)[0]) => {
    if (plan.price === "Free") return "Free";
    const monthlyPrice = parseInt(plan.price.replace(/[₦,]/g, ""));
    if (isYearly) {
      const yearlyPrice = Math.round(monthlyPrice * 10);
      return `₦${yearlyPrice.toLocaleString()}`;
    }
    return plan.price;
  };

  const getPeriod = (plan: (typeof pricingPlans)[0]) => {
    if (plan.price === "Free") return "";
    return isYearly ? "/yearly" : plan.period;
  };

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="EkoSpot Pricing" subtitle="Simple, transparent pricing for discovering and listing Lagos hotspots.">
        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-3">
          <Label
            htmlFor="billing-toggle"
            className={`text-sm font-medium ${
              !isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label
            htmlFor="billing-toggle"
            className={`text-sm font-medium ${
              isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 17%
            </Badge>
          </Label>
        </div>
      </PageHero>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-2 border-primary shadow-lg scale-[1.02]"
                  : "hover:shadow-lg"
              } transition-shadow`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">
                    {getPrice(plan)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getPeriod(plan)}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("register")}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Feature Comparison
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">Explorer</TableHead>
                  <TableHead className="text-center bg-primary/5">Scout</TableHead>
                  <TableHead className="text-center">Ambassador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureComparison.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">
                      {row.feature}
                    </TableCell>
                    {(["explorer", "scout", "ambassador"] as const).map(
                      (plan) => (
                        <TableCell key={plan} className="text-center">
                          {typeof row[plan] === "boolean" ? (
                            row[plan] ? (
                              <Check className="h-4 w-4 text-primary mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{row[plan]}</span>
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Pricing FAQ
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {pricingFaq.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you choose the right plan for exploring or listing Lagos hotspots.
          </p>
          <Button onClick={() => navigate("contact-us")}>
            Contact Sales
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
