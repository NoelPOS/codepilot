"use client";

import { PromptContext } from "@/context/PromptContext";
import { UserContext } from "@/context/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState } from "react";
import { ConvexClientProvider } from "./ConvexProvider";
import { usePersistedUser } from "@/hooks/usePersistedUser";

/**
 * GlobalProvider — root provider that composes all application-wide contexts.
 *
 * Uses usePersistedUser() to centralize localStorage hydration and persistence
 * instead of raw useState + useEffect with localStorage.
 */
export const GlobalProvider = ({ children }) => {
  const { user, setUser } = usePersistedUser();
  const [messages, setMessages] = useState();
  const [files, setFiles] = useState(null);

  return (
    <div>
      <ConvexClientProvider>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <UserContext.Provider value={{ user, setUser }}>
            <PromptContext.Provider value={{ messages, setMessages, files, setFiles }}>
              {children}
            </PromptContext.Provider>
          </UserContext.Provider>
        </GoogleOAuthProvider>
      </ConvexClientProvider>
    </div>
  );
};

// Backward-compatible alias for the old misspelled name
export const GlobalProvidor = GlobalProvider;
