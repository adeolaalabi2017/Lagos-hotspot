"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserTier = "explorer" | "scout" | "ambassador";
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: UserTier;
  role?: UserRole;
  suspendedAt?: string | null;
}

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  suspendedAt: Date | string | null;
}

interface TierFeature {
  maxSavedSpots: number;
  earlyAccess: boolean;
  recommendations: boolean;
  trendingAlerts: boolean;
  prioritySupport: boolean;
  listBusiness: boolean;
  analytics: boolean;
  featuredPlacement: boolean;
  respondToReviews: boolean;
  whatsappIntegration: boolean;
  customBranding: boolean;
}

export const TIER_FEATURES: Record<UserTier, TierFeature> = {
  explorer: {
    maxSavedSpots: 10,
    earlyAccess: false,
    recommendations: false,
    trendingAlerts: false,
    prioritySupport: false,
    listBusiness: false,
    analytics: false,
    featuredPlacement: false,
    respondToReviews: false,
    whatsappIntegration: false,
    customBranding: false,
  },
  scout: {
    maxSavedSpots: -1,
    earlyAccess: true,
    recommendations: true,
    trendingAlerts: true,
    prioritySupport: true,
    listBusiness: false,
    analytics: false,
    featuredPlacement: false,
    respondToReviews: false,
    whatsappIntegration: false,
    customBranding: false,
  },
  ambassador: {
    maxSavedSpots: -1,
    earlyAccess: true,
    recommendations: true,
    trendingAlerts: true,
    prioritySupport: true,
    listBusiness: true,
    analytics: true,
    featuredPlacement: true,
    respondToReviews: true,
    whatsappIntegration: true,
    customBranding: true,
  },
};

export const TIER_LABELS: Record<UserTier, string> = {
  explorer: "Explorer",
  scout: "Scout",
  ambassador: "Ambassador",
};

export const TIER_COLORS: Record<UserTier, string> = {
  explorer: "text-muted-foreground",
  scout: "text-orange-600",
  ambassador: "text-amber-600",
};

export const TIER_BG_COLORS: Record<UserTier, string> = {
  explorer: "bg-muted text-muted-foreground",
  scout: "bg-orange-50 text-orange-700 border-orange-200",
  ambassador: "bg-amber-50 text-amber-700 border-amber-200",
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: {
    email: string;
    password: string;
    name: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateTier: (tier: UserTier) => void;
  setRole: (role: UserRole) => Promise<void>;
  setSessionUser: (user: User | null) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function tierFromEmail(email: string): UserTier {
  if (email.startsWith("ambassador") || email.endsWith("@ambassador.lagos-hotspot")) {
    return "ambassador";
  }
  return "explorer";
}

function toUIUser(row: SessionUser): User {
  const name = row.name?.trim() ?? "";
  return {
    id: row.id,
    name: name || row.email.split("@")[0],
    email: row.email,
    avatar:
      row.avatar ??
      (initials(row.name ?? "") || row.email.slice(0, 2).toUpperCase()),
    tier: row.role === "admin" ? "ambassador" : tierFromEmail(row.email),
    role: row.role === "admin" ? "admin" : "user",
    suspendedAt: row.suspendedAt
      ? typeof row.suspendedAt === "string"
        ? row.suspendedAt
        : row.suspendedAt.toISOString()
      : null,
  };
}

const memoryStorage = {
  _data: new Map<string, string>(),
  getItem(name: string): string | null {
    return this._data.get(name) ?? null;
  },
  setItem(name: string, value: string): void {
    this._data.set(name, value);
  },
  removeItem(name: string): void {
    this._data.delete(name);
  },
};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const authStorage = isLocalStorageAvailable() ? localStorage : memoryStorage;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      async bootstrap() {
        if (typeof window === "undefined") {
          set({ isAuthenticated: false, user: null });
          return;
        }
        try {
          const base =
            typeof document !== "undefined" && document.baseURI
              ? document.baseURI
              : "/";
          const res = await fetch(`${base}api/auth/me`, {
            credentials: "same-origin",
          });
          if (!res.ok) {
            set({ isAuthenticated: false, user: null });
            return;
          }
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            set({ isAuthenticated: false, user: null });
            return;
          }
          const data = (await res.json()) as { user: SessionUser | null };
          if (data.user) {
            set({ isAuthenticated: true, user: toUIUser(data.user) });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } catch (err) {
          console.error("auth bootstrap failed:", err);
          set({ isAuthenticated: false, user: null });
        }
      },
      async login(email: string, password: string) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Login failed");
        }
        const data = (await res.json()) as { user: SessionUser };
        const uiUser = toUIUser(data.user);
        set({ isAuthenticated: true, user: uiUser });
        return uiUser;
      },
      async signup({ email, password, name }) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Signup failed");
        }
        const data = (await res.json()) as { user: SessionUser };
        const uiUser = toUIUser(data.user);
        set({ isAuthenticated: true, user: uiUser });
        return uiUser;
      },
      async logout() {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        });
        set({ isAuthenticated: false, user: null });
      },
      updateTier: (tier) =>
        set((state) => ({
          user: state.user ? { ...state.user, tier } : null,
        })),
      async setRole(role: UserRole) {
        // Role mutation requires the server: it's only used by /admin to flip a user.
        // Frontend optimistically updates then no-ops server side — actual server
        // mutation lives in /api/admin/users/[id]. Suspend/reinstate also there.
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        }));
      },
      setSessionUser: (user) =>
        set({
          isAuthenticated: !!user,
          user,
        }),
    }),
    {
      name: "lagos-hotspot-auth",
      version: 3,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState as never;
        if (version >= 3) return persistedState as never;
        // Reset older shapes; bootstrap will repopulate.
        return { isAuthenticated: false, user: null } as never;
      },
    }
  )
);
