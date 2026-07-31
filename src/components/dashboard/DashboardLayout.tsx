"use client";

import React, { useState } from "react";
import { type Route } from "@/lib/router";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Flame } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeRoute: Route;
}

export default function DashboardLayout({ children, activeRoute }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Open dashboard sections: overview, profile, saved spots,
                  reviews, and so on.
                </SheetDescription>
                <DashboardSidebar
                  activeRoute={activeRoute}
                  onToggle={() => setMobileOpen(false)}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Lagos Hotspot</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user?.avatar || "ES"}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <DashboardSidebar
            activeRoute={activeRoute}
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
