"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Route =
  | "home"
  | "explore"
  | "hotspot"
  | "dashboard"
  | "dashboard-profile"
  | "dashboard-saved"
  | "dashboard-reviews"
  | "dashboard-messages"
  | "dashboard-my-spots"
  | "dashboard-add-spot"
  | "dashboard-analytics"
  | "dashboard-reservations"
  | "admin"
  | "admin-listings"
  | "admin-import"
  | "admin-reviews"
  | "admin-users"
  | "admin-reports"
  | "admin-activity-log"
  | "login"
  | "register"
  | "forgot-password"
  | "about-us"
  | "blog"
  | "blog-detail"
  | "contact-us"
  | "pricing"
  | "privacy-policy"
  | "terms-of-service"
  | "help-center"
  | "help-article"
  | "faq"
  | "error";

interface RouterState {
  route: Route;
  params: Record<string, string>;
  navigate: (route: Route, params?: Record<string, string>) => void;
  goBack: () => void;
  history: Route[];
}

const RouterContext = createContext<RouterState | null>(null);

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

const routeFromHash = (hash: string): { route: Route; params: Record<string, string> } => {
  const clean = hash.replace(/^#\/?/, "");
  const [path, queryStr] = clean.split("?");
  const params: Record<string, string> = {};
  if (queryStr) {
    queryStr.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  }
  const validRoutes: Route[] = [
    "home", "explore", "hotspot", "dashboard",
    "dashboard-profile", "dashboard-saved", "dashboard-reviews",
    "dashboard-messages", "dashboard-my-spots", "dashboard-add-spot", "dashboard-analytics",
    "admin", "admin-listings", "admin-import", "admin-reviews", "admin-users", "admin-reports", "admin-activity-log",
    "login", "register", "forgot-password",
    "about-us", "blog", "blog-detail", "contact-us", "pricing",
    "privacy-policy", "terms-of-service", "help-center", "help-article",
    "faq", "error",
  ];
  // Support legacy routes by mapping them
  const legacyMap: Record<string, Route> = {
    "grid-listings": "explore",
    "single-listing": "hotspot",
    "dashboard-bookings": "dashboard-saved",
    "dashboard-listings": "dashboard-my-spots",
    "dashboard-bookmarks": "dashboard-saved",
    "dashboard-wallet": "dashboard",
    "dashboard-add-listing": "dashboard-add-spot",
    "two-factor-auth": "login",
    "author-profile": "dashboard-profile",
    "booking-page": "hotspot",
    "comingsoon": "home",
  };
  // Empty path defaults to home; invalid paths go to error
  let route: Route;
  if (!path) {
    route = "home";
  } else if (validRoutes.includes(path as Route)) {
    route = path as Route;
  } else if (legacyMap[path]) {
    route = legacyMap[path];
  } else {
    route = "error";
  }
  return { route, params };
};

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [routeState, setRouteState] = useState<{ route: Route; params: Record<string, string> }>(() => {
    if (typeof window !== "undefined") {
      return routeFromHash(window.location.hash);
    }
    return { route: "home", params: {} };
  });
  const [history, setHistory] = useState<Route[]>([routeState.route]);

  const navigate = useCallback((newRoute: Route, params: Record<string, string> = {}) => {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const hash = `#/${newRoute}${query ? `?${query}` : ""}`;
    window.location.hash = hash;
    setRouteState({ route: newRoute, params });
    setHistory((prev) => [...prev.slice(-49), newRoute]); // Cap at 50 entries
    window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      const newHist = prev.slice(0, -1);
      const lastRoute = newHist[newHist.length - 1] || "home";
      setRouteState({ route: lastRoute, params: {} });
      window.location.hash = `#/${lastRoute}`;
      return newHist;
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      const parsed = routeFromHash(window.location.hash);
      setRouteState(parsed);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <RouterContext.Provider value={{ ...routeState, navigate, goBack, history }}>
      {children}
    </RouterContext.Provider>
  );
}
