"use client";

import { useCallback } from "react";
import { create } from "zustand";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex-api";

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
  /** Session token from api.auth.login/signup; pass it to every Convex call made for the user. */
  token: string | null;
  setSessionUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  updateTier: (tier: UserTier) => void;
  setRole: (role: UserRole) => void;
}

const STORAGE_KEY = "lagos-hotspot-auth";
const TOKEN_KEY = "lagos-hotspot-token";

function saveToStorage(user: User | null, token: string | null): void {
  try {
    if (typeof localStorage !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  } catch {
    /* ignore */
  }
}

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw) {
        return { user: JSON.parse(raw) as User, token };
      }
    }
  } catch {
    /* ignore */
  }
  return { user: null, token: null };
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setSessionUser: (user, token = null) => {
    saveToStorage(user, user ? token : null);
    set({ isAuthenticated: !!user, user, token: user ? token : null });
  },
  logout: () => {
    saveToStorage(null, null);
    set({ isAuthenticated: false, user: null, token: null });
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
  const { user, token } = loadFromStorage();
  if (user) {
    useAuthStore.setState({ isAuthenticated: true, user, token });
  }
}

/** Revokes the session on the server, then clears local auth state. */
export function useSignOut() {
  const revoke = useMutation(api.auth.logout);
  const logout = useAuthStore((s) => s.logout);
  return useCallback(() => {
    const token = useAuthStore.getState().token;
    logout();
    if (token) revoke({ token }).catch(() => {});
  }, [revoke, logout]);
}
