"use client";

import React, { useState, useEffect } from "react";
import { useRouter, type Route } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import {
  Menu,
  X,
  ChevronDown,
  Plus,
  LogIn,
  Heart,
  User,
  Home,
  Compass,
  LayoutDashboard,
  Search,
  Info,
  HelpCircle,
  Star,
  MapPin,
  Flame,
  MessageSquare,
  Map,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { toast } from "sonner";

interface NavbarProps {
  variant?: "transparent" | "solid" | "dashboard";
}

export default function Navbar({ variant = "solid" }: NavbarProps) {
  const { navigate, route } = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isTransparent = variant === "transparent" && !scrolled;

  // Build nav links dynamically based on auth state
  const getNavLinks = () => {
    const links: {
      label: string;
      route?: Route;
      children?: { label: string; route: Route; icon?: React.ReactNode }[];
    }[] = [
      { label: "Home", route: "home" },
      { label: "Explore", route: "explore" },
      { label: "Pricing", route: "pricing" },
      { label: "Blog", route: "blog" },
    ];

    if (isAuthenticated) {
      links.push({
        label: "Dashboard",
        children: [
          { label: "Overview", route: "dashboard" as Route, icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
          { label: "My Profile", route: "dashboard-profile" as Route, icon: <User className="h-4 w-4 mr-2" /> },
          { label: "Saved Spots", route: "dashboard-saved" as Route, icon: <Heart className="h-4 w-4 mr-2" /> },
          { label: "My Reviews", route: "dashboard-reviews" as Route, icon: <Star className="h-4 w-4 mr-2" /> },
          { label: "Messages", route: "dashboard-messages" as Route, icon: <MessageSquare className="h-4 w-4 mr-2" /> },
          { label: "My Spots", route: "dashboard-my-spots" as Route, icon: <MapPin className="h-4 w-4 mr-2" /> },
          { label: "Add Spot", route: "dashboard-add-spot" as Route, icon: <Plus className="h-4 w-4 mr-2" /> },
        ],
      });
    }

    links.push({ label: "Contact", route: "contact-us" });

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header
      className={`sticky top-0 z-50 w-full motion-safe:transition-[background-color,border-color] motion-safe:duration-200 ${
        isTransparent
          ? "bg-transparent text-white border-b border-transparent"
          : "bg-background border-b border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/images/ekospot-Ikoyi-link-bridge.webp"
                alt="Lagos hotspot"
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`text-xl font-bold ${
                isTransparent ? "text-white" : "text-foreground"
              }`}
            >
              Lagos hotspot
            </span>
          </button>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                        isTransparent
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    {link.children.map((child) => (
                      <DropdownMenuItem
                        key={child.label}
                        onClick={() => navigate(child.route)}
                        className="cursor-pointer"
                      >
                        {child.icon}
                        {child.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={link.label}
                  onClick={() => navigate(link.route!)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                    isTransparent
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : route === link.route
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate("dashboard-add-spot")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Spot
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex"
                onClick={() => {
                  toast.info("Sign in to submit a new hotspot to EkoSpot");
                  navigate("login");
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Spot
              </Button>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {user?.avatar || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("dashboard-profile")}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("home"); }}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={`hidden sm:flex relative h-11 w-11 ${
                  isTransparent ? "text-white hover:bg-white/10" : ""
                }`}
                onClick={() => navigate("login")}
                aria-label="Sign in"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 ${
                isTransparent ? "text-white hover:bg-white/10" : ""
              }`}
              onClick={() => {
                if (isAuthenticated) {
                  navigate("dashboard-saved");
                } else {
                  toast.info("Sign in to save your favorite spots");
                  navigate("login");
                }
              }}
              aria-label="Saved spots"
            >
              <Heart className="h-4 w-4" />
            </Button>
            {user?.role === "admin" ? (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-11 w-11 text-inherit hover:bg-white/10"
                aria-label="Admin"
                onClick={() => navigate("admin-listings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : null}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden h-11 w-11 ${
                    isTransparent ? "text-white hover:bg-white/10" : ""
                  }`}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Browse EkoSpot pages and your dashboard.
                </SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-lg font-bold">Lagos hotspot</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <div className="space-y-1">
                      <MobileNavItem
                        icon={<Home className="h-4 w-4" />}
                        label="Home"
                        onClick={() => {
                          navigate("home");
                          setMobileOpen(false);
                        }}
                      />

                      <MobileNavItem
                        icon={<Compass className="h-4 w-4" />}
                        label="Explore"
                        onClick={() => {
                          navigate("explore");
                          setMobileOpen(false);
                        }}
                      />

                      {/* Dashboard section — only when signed in */}
                      {isAuthenticated && (
                        <>
                          <div className="pt-3 pb-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Dashboard
                            </span>
                          </div>
                          <MobileNavItem
                            icon={<LayoutDashboard className="h-4 w-4" />}
                            label="Overview"
                            onClick={() => {
                              navigate("dashboard");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<User className="h-4 w-4" />}
                            label="My Profile"
                            onClick={() => {
                              navigate("dashboard-profile");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<Heart className="h-4 w-4" />}
                            label="Saved Spots"
                            onClick={() => {
                              navigate("dashboard-saved");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<Star className="h-4 w-4" />}
                            label="My Reviews"
                            onClick={() => {
                              navigate("dashboard-reviews");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<MessageSquare className="h-4 w-4" />}
                            label="Messages"
                            onClick={() => {
                              navigate("dashboard-messages");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<MapPin className="h-4 w-4" />}
                            label="My Spots"
                            onClick={() => {
                              navigate("dashboard-my-spots");
                              setMobileOpen(false);
                            }}
                          />
                          <MobileNavItem
                            icon={<Plus className="h-4 w-4" />}
                            label="Add Spot"
                            onClick={() => {
                              navigate("dashboard-add-spot");
                              setMobileOpen(false);
                            }}
                          />
                        </>
                      )}

                      <div className="pt-3 pb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Company
                        </span>
                      </div>
                      <MobileNavItem
                        icon={<Info className="h-4 w-4" />}
                        label="About Us"
                        onClick={() => {
                          navigate("about-us");
                          setMobileOpen(false);
                        }}
                      />
                      <MobileNavItem
                        icon={<HelpCircle className="h-4 w-4" />}
                        label="Help Center"
                        onClick={() => {
                          navigate("help-center");
                          setMobileOpen(false);
                        }}
                      />

                      {/* Auth section */}
                      {!isAuthenticated && (
                        <>
                          <div className="pt-3 pb-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Account
                            </span>
                          </div>
                          <MobileNavItem
                            icon={<LogIn className="h-4 w-4" />}
                            label="Sign In"
                            onClick={() => {
                              navigate("login");
                              setMobileOpen(false);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    {isAuthenticated ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          logout();
                          navigate("home");
                          setMobileOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          toast.info("Sign in to submit a new hotspot to EkoSpot");
                          navigate("login");
                          setMobileOpen(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add a Spot
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNavItem({
  icon,
  label,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
    >
      {icon}
      {label}
    </button>
  );
}
