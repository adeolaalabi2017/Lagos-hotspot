"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import {
  Briefcase,
  Star,
  Users as UsersIcon,
  Flag,
  Activity,
  Upload,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AdminRoute =
  | "admin"
  | "admin-listings"
  | "admin-import"
  | "admin-reviews"
  | "admin-users"
  | "admin-reports"
  | "admin-activity-log";

const NAV_ITEMS: Array<{
  route: AdminRoute;
  label: string;
  Icon: React.ElementType;
  description: string;
}> = [
  {
    route: "admin-listings",
    label: "Hotspots",
    Icon: Briefcase,
    description: "Author and edit listings",
  },
  {
    route: "admin-import",
    label: "CSV import",
    Icon: Upload,
    description: "Bulk-create hotspots",
  },
  {
    route: "admin-reviews",
    label: "Reviews",
    Icon: Star,
    description: "Moderate user reviews",
  },
  {
    route: "admin-users",
    label: "Users",
    Icon: UsersIcon,
    description: "Search and suspend accounts",
  },
  {
    route: "admin-reports",
    label: "Reports",
    Icon: Flag,
    description: "Resolve user reports",
  },
  {
    route: "admin-activity-log",
    label: "Activity log",
    Icon: Activity,
    description: "Audit trail",
  },
];

interface AdminLayoutProps {
  current: AdminRoute;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({
  current,
  title,
  description,
  actions,
  children,
}: AdminLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <header className="mb-8 lg:mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Admin
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-pretty">
              {title}
            </h1>
            {description ? (
              <p className="text-muted-foreground mt-3 text-pretty">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <nav aria-label="Admin sections" className="space-y-1">
              {NAV_ITEMS.map(({ route, label, Icon, description }) => {
                const isActive = route === current;
                return (
                  <button
                    key={route}
                    onClick={() => router.navigate(route)}
                    className={cn(
                      "group w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left motion-safe:transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden
                    />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          isActive ? "text-foreground" : ""
                        )}
                      >
                        {label}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {description}
                      </span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 mt-1",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="lg:hidden -mt-2 mb-2">
            <details
              open={mobileOpen}
              onToggle={(e) => setMobileOpen((e.target as HTMLDetailsElement).open)}
              className="rounded-lg border bg-card"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium flex items-center justify-between">
                Sections
                <ChevronRight className="h-4 w-4" />
              </summary>
              <div className="border-t p-2 space-y-1">
                {NAV_ITEMS.map(({ route, label, Icon }) => (
                  <Button
                    key={route}
                    variant={route === current ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      router.navigate(route);
                      setMobileOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </details>
          </div>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
