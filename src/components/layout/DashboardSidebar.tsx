"use client";

import React from "react";
import { useRouter, type Route } from "@/lib/router";
import { useAuthStore, TIER_LABELS, TIER_BG_COLORS, type UserTier } from "@/lib/auth-store";
import {
  LayoutDashboard,
  User,
  Bookmark,
  Star,
  MessageSquare,
  MapPin,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  activeRoute: Route;
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  route: Route;
  requiredTier?: UserTier; // minimum tier required to see this item
}

const sidebarItems: SidebarItem[] = [
  { label: "Overview", icon: LayoutDashboard, route: "dashboard" },
  { label: "My Profile", icon: User, route: "dashboard-profile" },
  { label: "Saved Spots", icon: Bookmark, route: "dashboard-saved" },
  { label: "My Reviews", icon: Star, route: "dashboard-reviews" },
  { label: "Messages", icon: MessageSquare, route: "dashboard-messages" },
  { label: "My Spots", icon: MapPin, route: "dashboard-my-spots" },
  { label: "Analytics", icon: BarChart3, route: "dashboard-analytics", requiredTier: "hotspot" },
  { label: "Add Spot", icon: PlusCircle, route: "dashboard-add-spot" },
];

const tierIcons: Record<UserTier, React.ElementType> = {
  explorer: MapPin,
  
  hotspot: Flame,
};

export default function DashboardSidebar({ activeRoute, collapsed = false, onToggle, onNavigate }: DashboardSidebarProps) {
  const { navigate } = useRouter();
  const { user, logout } = useAuthStore();

  const userTier = user?.tier || "explorer";
  const TierIcon = tierIcons[userTier];

  const handleItemClick = (item: SidebarItem) => {
    navigate(item.route);
    onNavigate?.();
  };

  return (
    <aside
      aria-label="Dashboard sidebar"
      className={cn(
        "bg-white border-r border-border h-full flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("p-4 border-b border-border", collapsed && "p-2 justify-center")}>
        <button
          onClick={() => navigate("home")}
          className={cn("flex items-center gap-2 w-full", collapsed && "justify-center")}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">Lagos Hotspot</span>
          )}
        </button>
      </div>

      {/* User Info & Tier */}
      <div className={cn("p-4 border-b border-border", collapsed && "p-2")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
            {user?.avatar || "ES"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name || "Explorer"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 h-4 font-medium", TIER_BG_COLORS[userTier])}
                >
                  <TierIcon className="h-2.5 w-2.5 mr-0.5" />
                  {TIER_LABELS[userTier]}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
        {sidebarItems
          .filter((item) => {
            if (!item.requiredTier) return true;
            const tierOrder: Record<UserTier, number> = { explorer: 0, hotspot: 1 };
            return tierOrder[userTier] >= tierOrder[item.requiredTier];
          })
          .map((item) => {
          const isActive = activeRoute === item.route;

          return (
            <Button
              key={item.route + item.label}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors justify-start",
                collapsed && "justify-center px-0",
                !isActive && "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-border space-y-0.5">
        <Button
          variant="ghost"
          onClick={() => { navigate("home"); onNavigate?.(); }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors justify-start",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Back to Site" : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={() => { logout(); navigate("login"); onNavigate?.(); }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors justify-start",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
        {onToggle && (
          <Button
            variant="ghost"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent transition-colors justify-start",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
}
