"use client";

import { create } from "zustand";

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
  setSessionUser: (user: User | null) => void;
  logout: () => void;
  updateTier: (tier: UserTier) => void;
  setRole: (role: UserRole) => void;
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

// Storage helpers that work in both browser and Cloudflare Workers runtime
const memoryStorage = new Map<string, string>();

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage.getItem(key);
  } catch {}
  return memoryStorage.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStorage.set(key, value);
}

function removeItem(key: string): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch {}
  memoryStorage.delete(key);
}

const STORAGE_KEY = "lagos-hotspot-auth";

function loadPersistedUser(): User | null {
  try {
    const raw = getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function persistUser(user: User | null): void {
  if (user) {
    setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setSessionUser: (user) => {
    persistUser(user);
    set({ isAuthenticated: !!user, user });
  },
  logout: () => {
    persistUser(null);
    set({ isAuthenticated: false, user: null });
  },
  updateTier: (tier) =>
    set((state) => ({
      user: state.user ? { ...state.user, tier } : null,
    })),
  setRole: (role: UserRole) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));

// Load persisted user on client-side mount
if (typeof window !== "undefined") {
  const user = loadPersistedUser();
  if (user) {
    useAuthStore.setState({ isAuthenticated: true, user });
  }
}
