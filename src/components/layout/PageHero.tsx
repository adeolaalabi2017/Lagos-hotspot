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
      <section className="bg-foreground text-background py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-balance mb-4">{title}</h1>
          {subtitle && <p className="text-lg text-background/80 max-w-2xl mx-auto mb-6 text-pretty">{subtitle}</p>}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/40 border-b py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-balance mb-4">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 text-pretty">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
