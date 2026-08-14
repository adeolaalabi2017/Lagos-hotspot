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

const STORAGE_KEY = "lagos-hotspot-auth";

function saveToStorage(user: User | null): void {
  try {
    if (typeof localStorage !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    /* ignore */
  }
}

function loadFromStorage(): User | null {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as User;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setSessionUser: (user) => {
    saveToStorage(user);
    set({ isAuthenticated: !!user, user });
  },
  logout: () => {
    saveToStorage(null);
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

// Load persisted user on client-side init
if (typeof window !== "undefined") {
  const user = loadFromStorage();
  if (user) {
    useAuthStore.setState({ isAuthenticated: true, user });
  }
}
