import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Lagos Hotspot — Discover the Pulse of Lagos",
  description: "Find the hottest spots in Lagos State — restaurants, nightlife, beaches, culture, and more. Your guide to living your best Lagos life.",
  keywords: ["Lagos Hotspot", "Lagos hotspots", "Lagos restaurants", "Lagos nightlife", "Lagos beaches", "discover Lagos", "Lagos guide"],
  authors: [{ name: "Lagos Hotspot Team" }],
  icons: {
    icon: "/images/lagos-hotspot-favicon.png",
  },
  openGraph: {
    title: "Lagos Hotspot — Discover the Pulse of Lagos",
    description: "Find the hottest spots in Lagos State — restaurants, nightlife, beaches, culture, and more.",
    siteName: "Lagos Hotspot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lagos Hotspot — Discover the Pulse of Lagos",
    description: "Find the hottest spots in Lagos State — restaurants, nightlife, beaches, culture, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md">
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
