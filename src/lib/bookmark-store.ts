"use client";

import { create } from "zustand";
import { convex } from "@/components/convex-provider";
import { api } from "@/lib/convex-api";
import { useAuthStore } from "@/lib/auth-store";

interface BookmarkState {
  bookmarkedIds: string[];
  bookmarkedIdsAnonymous: string[];
  loading: boolean;
  error: string | null;
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  removeBookmark: (id: string) => void;
  canSaveMore: (limit: number) => boolean;
  remainingSaves: (limit: number) => number;
  /** Reloads saved ids from Convex for the signed-in user; clears them when signed out. */
  refresh: () => Promise<void>;
  setIds: (ids: string[]) => void;
}

function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw.filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedIds: [],
  bookmarkedIdsAnonymous: [],
  loading: false,
  error: null,

  toggleBookmark(id) {
    const current = get();
    const isAnonymousSaved = current.bookmarkedIdsAnonymous.includes(id);
    const isAuthSaved = current.bookmarkedIds.includes(id);
    if (isAnonymousSaved) {
      set((state) => ({
        bookmarkedIdsAnonymous: state.bookmarkedIdsAnonymous.filter(
          (bid) => bid !== id
        ),
      }));
      return;
    }
    if (isAuthSaved) {
      get().removeBookmark(id);
      return;
    }
    set((state) => ({
      bookmarkedIds: [...state.bookmarkedIds, id],
      error: null,
    }));
    const token = useAuthStore.getState().token;
    if (!token) return;
    convex.mutation(api.bookmarks.createBookmark, { token, listingId: id }).catch(() => {
      set((state) => ({
        bookmarkedIds: state.bookmarkedIds.filter((bid) => bid !== id),
        error: "Could not save spot",
      }));
    });
  },

  isBookmarked(id) {
    const state = get();
    return (
      state.bookmarkedIds.includes(id) ||
      state.bookmarkedIdsAnonymous.includes(id)
    );
  },

  removeBookmark(id) {
    const wasSaved = get().bookmarkedIds.includes(id);
    const token = useAuthStore.getState().token;
    if (wasSaved && token) {
      convex.mutation(api.bookmarks.deleteBookmark, { token, listingId: id }).catch(() => {
        set((state) => ({
          bookmarkedIds: [...state.bookmarkedIds, id],
          error: "Could not remove spot",
        }));
      });
    }
    set((state) => ({
      bookmarkedIds: state.bookmarkedIds.filter((bid) => bid !== id),
      bookmarkedIdsAnonymous: state.bookmarkedIdsAnonymous.filter(
        (bid) => bid !== id
      ),
      error: null,
    }));
  },

  canSaveMore(limit) {
    if (limit === -1) return true;
    return get().bookmarkedIds.length < limit;
  },

  remainingSaves(limit) {
    if (limit === -1) return Infinity;
    return Math.max(0, limit - get().bookmarkedIds.length);
  },

  async refresh() {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ bookmarkedIds: [], loading: false });
      return;
    }
    set({ loading: true });
    try {
      const ids = await convex.query(api.bookmarks.listBookmarks, { token });
      set({ bookmarkedIds: sanitizeIds(ids), error: null });
    } catch {
      set({ error: "Could not load saved spots" });
    } finally {
      set({ loading: false });
    }
  },

  setIds(ids) {
    set({ bookmarkedIds: sanitizeIds(ids) });
  },
}));
