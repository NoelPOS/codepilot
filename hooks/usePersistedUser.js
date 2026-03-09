"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "user";

/**
 * usePersistedUser — centralizes localStorage user persistence.
 *
 * Replaces the scattered `localStorage.getItem("user")` / `setItem` calls
 * that were duplicated across GlobalProvider, page.js, Header, and Dashboard.
 *
 * @returns {{ user, setUser, clearUser }}
 *   - user:      The current user object (or undefined if not logged in)
 *   - setUser:   Updates both React state and localStorage
 *   - clearUser: Removes the user from state and localStorage (sign out)
 */
export function usePersistedUser() {
  const [user, setUserState] = useState(undefined);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUserState(JSON.parse(stored));
        }
      } catch {
        // Corrupted localStorage entry — ignore and start fresh
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Update both state and localStorage in one call
  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Convenience for sign-out
  const clearUser = useCallback(() => {
    setUserState(undefined);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { user, setUser, clearUser };
}
