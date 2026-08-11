"use client";

import { RouterProvider } from "@/lib/router";
import AboutUsPage from "@/components/pages/AboutUsPage";

export default function AboutPage() {
  return (
    <RouterProvider>
      <AboutUsPage />
    </RouterProvider>
  );
}
