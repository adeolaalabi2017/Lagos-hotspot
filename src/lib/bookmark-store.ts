"use client";

import { create } from "zustand";

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
  refresh: () => void;
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
    if (!isAuthSaved) {
      set((state) => ({
        bookmarkedIds: [...state.bookmarkedIds, id],
        error: null,
      }));
    } else {
      get().removeBookmark(id);
    }
  },

  isBookmarked(id) {
    const state = get();
    return (
      state.bookmarkedIds.includes(id) ||
      state.bookmarkedIdsAnonymous.includes(id)
    );
  },

  removeBookmark(id) {
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

  refresh() {
    // Bookmarks are now managed via Convex queries in components
  },

  setIds(ids) {
    set({ bookmarkedIds: sanitizeIds(ids) });
  },
}));
