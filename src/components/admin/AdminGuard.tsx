"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  // Wait for the saved session to load before redirecting (see app/page.tsx).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      router.navigate("login");
      toast.info("Sign in as an admin to continue");
      return;
    }
    if (user.role !== "admin") {
      router.navigate("home");
      toast.error("Admins only");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Checking admin access…
      </div>
    );
  }

  return <>{children}</>;
}
