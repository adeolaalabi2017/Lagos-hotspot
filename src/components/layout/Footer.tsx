"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import { Instagram, Twitter, MapPin, Mail } from "lucide-react";

const footerLinks = [
  { label: "Explore", route: "explore" as const },
  { label: "Pricing", route: "pricing" as const },
  { label: "Blog", route: "blog" as const },
  { label: "Contact", route: "contact-us" as const },
  { label: "About", route: "about-us" as const },
  { label: "Help Center", route: "help-center" as const },
  { label: "Terms", route: "terms-of-service" as const },
  { label: "Privacy", route: "privacy-policy" as const },
];

const social = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com/lagos-hotspot" },
  { Icon: Twitter, label: "Twitter", href: "https://twitter.com/lagos-hotspot" },
];

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
          {/* Brand row */}
          <div>
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 mb-3"
            >
              <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src="/images/lagos-hotspot-Ikoyi-link-bridge.webp"
                  alt="Lagos hotspot"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-base font-semibold text-foreground">Lagos hotspot</span>
            </button>
            <p className="text-sm text-muted-foreground max-w-md text-pretty">
              Your honest, Lagosian-written guide to the city&apos;s best
              restaurants, clubs, beaches, and hidden corners.
            </p>
            <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
              <a
                href="mailto:hello@lagos-hotspot.com"
                className="inline-flex items-center gap-1.5 hover:text-foreground motion-safe:transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                hello@lagos-hotspot.com
              </a>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Lagos, Nigeria
              </span>
            </div>
          </div>

          {/* Right column: nav + social stacked */}
          <div className="md:text-right space-y-4">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
              {footerLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  className="text-sm text-muted-foreground hover:text-foreground motion-safe:transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="flex md:justify-end gap-2">
              {social.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground flex items-center justify-center motion-safe:transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lagos Hotspot. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with 🔥 in Lagos.
          </p>
        </div>
      </div>
    </footer>
  );
}
