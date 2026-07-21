"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import { Home, Compass, Flame, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const { navigate, goBack } = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg mx-auto">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center justify-center gap-2 mx-auto mb-8"
        >
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">EkoSpot</span>
        </button>

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] sm:text-[160px] font-bold text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <SearchX className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Spot Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Oops! This spot must be hiding somewhere between Third Mainland Bridge
          and Elegushi Beach. Let&apos;s get you back to discovering the best of Lagos!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("home")}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("explore")}>
            <Compass className="h-4 w-4 mr-2" />
            Explore Spots
          </Button>
        </div>
      </div>
    </div>
  );
}
