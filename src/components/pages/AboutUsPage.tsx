"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import {
  Target,
  Eye,
  Users,
  MapPin,
  Flame,
  Heart,
  ArrowRight,
  Compass,
} from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teamMembers = [
  { name: "Adaeze Okoro", role: "CEO & Co-Founder", initials: "AO" },
  { name: "Chinedu Eze", role: "CTO & Co-Founder", initials: "CE" },
  { name: "Folake Adebayo", role: "Head of Content", initials: "FA" },
  { name: "Obi Nwanze", role: "Head of Community", initials: "ON" },
];

const stats = [
  { label: "Hotspots Listed", value: "1,200+", icon: MapPin },
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Areas Covered", value: "20+", icon: Compass },
  { label: "Reviews Written", value: "100K+", icon: Heart },
];

const values = [
  {
    icon: Users,
    title: "Community",
    description: "We believe the best recommendations come from real Lagosians who live and breathe the city every day.",
  },
  {
    icon: Flame,
    title: "Authenticity",
    description: "Every hotspot on Lagos Hotspot is verified. We champion genuine experiences over paid promotions.",
  },
  {
    icon: Compass,
    title: "Discovery",
    description: "From hidden gems in Surulere to rooftop bars in VI, we help you discover spots you never knew existed.",
  },
];

export default function AboutUsPage() {
  const { navigate } = useRouter();

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="About Lagos Hotspot" subtitle="Your guide to the hottest spots in Lagos" />

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Our Story
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Lagos Hotspot was born in Lagos — a city of 20 million people, thousands of incredible
                restaurants, clubs, beaches, galleries, and hangout spots, yet no single trusted
                platform to discover them all. We kept asking: &ldquo;Where&apos;s the vibe tonight?&rdquo;
                and getting scattered answers from group chats and Instagram stories.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2024, Lagos Hotspot set out to change that. We built a platform where real
                Lagosians share honest reviews, where the hottest spots rise to the top based on
                genuine vibes — not paid ads — and where discovering the city becomes an adventure,
                not a guessing game.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Lagos Hotspot is the most trusted guide to Lagos&apos; vibrant scene. From the
                suya spots of Yaba to the rooftop lounges of Victoria Island, we help you find
                your next favorite place in the city that never sleeps.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Lagos Hotspot Team in Lagos"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mission & Vision
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Our Mission
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be the most trusted guide to Lagos&apos; vibrant scene — connecting
                  people with authentic experiences, supporting local businesses, and
                  making every day in Lagos an opportunity for discovery.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Our Vision
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  A Lagos where no great spot goes undiscovered. We envision a city
                  where every Lagosian — from Agege to Ajah — can find their perfect
                  spot for any moment, backed by a community of honest recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Meet Our Team
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The passionate Lagosians behind Lagos Hotspot who work tirelessly to
              help you discover the best the city has to offer.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center group hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Avatar className="w-20 h-20 mx-auto mb-3 group-hover:ring-2 group-hover:ring-primary transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-sm text-foreground">
                    {member.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {member.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-primary-foreground/80 mx-auto mb-2" />
                <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/80 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Explore Lagos?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of Lagosians who trust Lagos Hotspot to discover the city&apos;s
            best restaurants, nightlife, beaches, and hidden gems.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("register")}>
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("contact-us")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
