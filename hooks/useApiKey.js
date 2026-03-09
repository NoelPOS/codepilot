"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "gemini_api_key";

/**
 * useApiKey — manages the user's Gemini API key in localStorage.
 *
 * The key is stored only in the user's browser and never sent to our servers.
 * This is the BYOK (Bring Your Own Key) pattern — the user is responsible for
 * their own Gemini quota, so the app costs nothing to run.
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(null);

  // Read from localStorage on mount and listen to changes across components
  useEffect(() => {
    const readKey = () => setApiKeyState(localStorage.getItem(STORAGE_KEY));
    readKey();

    window.addEventListener("gemini_api_key_changed", readKey);
    return () => window.removeEventListener("gemini_api_key_changed", readKey);
  }, []);

  const saveApiKey = (key) => {
    const trimmed = key.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKeyState(trimmed);
    window.dispatchEvent(new Event("gemini_api_key_changed"));
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
    window.dispatchEvent(new Event("gemini_api_key_changed"));
  };

  return { apiKey, saveApiKey, clearApiKey };
}
