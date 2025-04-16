"use client";

import { PromptContext } from "@/context/PromptContext";
import { UserContext } from "@/context/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useEffect, useState } from "react";
import { ConvexClientProvider } from "./ConvexProvider";

export const GlobalProvidor = ({ children }) => {
  const [user, setUser] = useState();
  const [prompt, setPrompt] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUser(user);
      }
    }
  }, []);
  return (
    <div>
      <ConvexClientProvider>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <UserContext.Provider value={{ user, setUser }}>
            <PromptContext.Provider value={{ prompt, setPrompt }}>
              {children}
            </PromptContext.Provider>
          </UserContext.Provider>
        </GoogleOAuthProvider>
      </ConvexClientProvider>
    </div>
  );
};
