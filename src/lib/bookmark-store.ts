"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkState {
  bookmarkedIds: string[];
  bookmarkedIdsAnonymous: string[];
  loading: boolean;
  error: string | null;
  readonly: boolean;
  toggleBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  removeBookmark: (id: string) => Promise<void>;
  canSaveMore: (limit: number) => boolean;
  remainingSaves: (limit: number) => number;
  refresh: () => Promise<void>;
  setIds: (ids: string[]) => void;
  setError: (msg: string | null) => void;
}

function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw.filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );
}

async function isAuthed(): Promise<boolean> {
  try {
    const base =
      typeof document !== "undefined" && document.baseURI
        ? document.baseURI
        : "";
    const res = await fetch(`${base}api/auth/me`, {
      credentials: "same-origin",
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as {
      user?: unknown;
    } | null;
    return Boolean(data?.user);
  } catch {
    return false;
  }
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      bookmarkedIdsAnonymous: [],
      loading: false,
      error: null,
      readonly: false,

      async toggleBookmark(id) {
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
          const authed = await isAuthed();
          if (!authed) {
            set((state) => ({
              bookmarkedIdsAnonymous: [
                ...state.bookmarkedIdsAnonymous.filter((bid) => bid !== id),
                id,
              ],
            }));
            return;
          }
          set((state) => ({
            bookmarkedIds: [...state.bookmarkedIds, id],
            error: null,
          }));
          const res = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ listingId: id }),
          });
          if (!res.ok) {
            set((state) => ({
              bookmarkedIds: state.bookmarkedIds.filter((bid) => bid !== id),
              error: res.status === 403 ? "Suspended" : "Could not bookmark",
            }));
            return;
          }
        } else {
          await get().removeBookmark(id);
        }
      },

      isBookmarked(id) {
        const state = get();
        return (
          state.bookmarkedIds.includes(id) ||
          state.bookmarkedIdsAnonymous.includes(id)
        );
      },

      async removeBookmark(id) {
        const current = get();
        const wasAnonymous = current.bookmarkedIdsAnonymous.includes(id);
        const wasAuth = current.bookmarkedIds.includes(id);
        if (wasAnonymous) {
          set((state) => ({
            bookmarkedIdsAnonymous: state.bookmarkedIdsAnonymous.filter(
              (bid) => bid !== id
            ),
          }));
          return;
        }
        if (!wasAuth) return;

        // Optimistic
        set((state) => ({
          bookmarkedIds: state.bookmarkedIds.filter((bid) => bid !== id),
          error: null,
        }));

        const res = await fetch(
          `/api/bookmarks/${encodeURIComponent(id)}`,
          { method: "DELETE", credentials: "same-origin" }
        );
        if (!res.ok && res.status !== 404) {
          set((state) => ({
            bookmarkedIds: [...state.bookmarkedIds, id],
            error: res.status === 403 ? "Suspended" : "Could not unbookmark",
          }));
        }
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
        const authed = await isAuthed();
        if (!authed) {
          // Logged out: clear server-synced set; keep anonymous bookmarks.
          set({
            bookmarkedIds: [],
            loading: false,
            error: null,
            readonly: false,
          });
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await fetch("/api/bookmarks", {
            credentials: "same-origin",
          });
          if (!res.ok) {
            set({ loading: false, error: null });
            return;
          }
          const data = (await res.json().catch(() => ({}))) as {
            ids?: unknown;
          };
          const ids = sanitizeIds(data.ids);
          // Pull anonymous bookmarks into the server-synced set as a courtesy,
          // so a signed-in user doesn't lose what they saved locally.
          const anonymous = get().bookmarkedIdsAnonymous;
          const anonymousToPromote = anonymous.filter(
            (id) => !ids.includes(id)
          );
          for (const id of anonymousToPromote) {
            try {
              await fetch("/api/bookmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ listingId: id }),
              });
            } catch {
              /* tolerate silent failures; the active user knows they can re-save */
            }
          }
          const next = Array.from(new Set([...ids, ...anonymous]));
          set({
            bookmarkedIds: next,
            bookmarkedIdsAnonymous: [],
            loading: false,
            error: null,
            readonly: false,
          });
        } catch (err) {
          console.error("bookmark refresh failed:", err);
          set({ loading: false, error: "Could not load bookmarks" });
        }
      },

      setIds(ids) {
        set({ bookmarkedIds: sanitizeIds(ids) });
      },

      setError(msg) {
        set({ error: msg });
      },
    }),
    {
      name: "lagos-hotspot-bookmarks",
      version: 2,
      partialize: (state) => ({
        bookmarkedIds: state.bookmarkedIds,
        bookmarkedIdsAnonymous: state.bookmarkedIdsAnonymous,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return {
            bookmarkedIds: [],
            bookmarkedIdsAnonymous: [],
          };
        }
        const state = persistedState as Partial<BookmarkState>;
        if (version < 2) {
          return {
            bookmarkedIds: sanitizeIds(state.bookmarkedIds),
            bookmarkedIdsAnonymous: [],
          };
        }
        return {
          bookmarkedIds: sanitizeIds(state.bookmarkedIds),
          bookmarkedIdsAnonymous: sanitizeIds(state.bookmarkedIdsAnonymous),
        };
      },
    }
  )
);
