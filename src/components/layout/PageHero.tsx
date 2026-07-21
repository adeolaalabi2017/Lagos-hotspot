"use client";

import React from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: "light" | "dark";
  children?: React.ReactNode;
}

export default function PageHero({ title, subtitle, variant = "light", children }: PageHeroProps) {
  if (variant === "dark") {
    return (
      <section className="bg-gradient-to-br from-primary via-primary to-orange-700 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">{subtitle}</p>}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-orange-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 text-pretty">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
