"use client";

import { create } from "zustand";

export type UserTier = "explorer" | "hotspot";
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
  listBusiness: boolean;
  maxImages: number;
  analytics: "none" | "simple";
  contactInfo: boolean;
}

export const TIER_FEATURES: Record<UserTier, TierFeature> = {
  explorer: {
    maxSavedSpots: 10,
    listBusiness: false,
    maxImages: 0,
    analytics: "none",
    contactInfo: false,
  },
  hotspot: {
    maxSavedSpots: 10,
    listBusiness: true,
    maxImages: 5,
    analytics: "simple",
    contactInfo: true,
  },
};

export const TIER_LABELS: Record<UserTier, string> = {
  explorer: "Explorer",
  hotspot: "Hotspot Owner",
};

export const TIER_DESCRIPTIONS: Record<UserTier, string> = {
  explorer: "Discover and save the hottest spots in Lagos",
  hotspot: "List your business and reach thousands of customers",
};

export const TIER_COLORS: Record<UserTier, string> = {
  explorer: "text-muted-foreground",
  hotspot: "text-primary",
};

export const TIER_BG_COLORS: Record<UserTier, string> = {
  explorer: "bg-muted text-muted-foreground",
  hotspot: "bg-primary/10 text-primary border-primary/20",
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
