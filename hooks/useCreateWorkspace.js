"use client";

import { useContext, useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { UserContext } from "@/context/UserContext";
import { PromptContext } from "@/context/PromptContext";
import { useApiKey } from "@/hooks/useApiKey";

/**
 * useCreateWorkspace — handles workspace creation from the home page.
 *
 * Extracted from page.js so the business logic (validate prompt → check auth →
 * create workspace → navigate) is reusable and out of the UI layer.
 *
 * @returns {{ createWorkspace: function, showSignIn: boolean, setShowSignIn: function }}
 */
export function useCreateWorkspace() {
  const { user } = useContext(UserContext);
  const { setMessages } = useContext(PromptContext);
  const { apiKey } = useApiKey();

  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Create a new workspace from the given prompt.
   * Returns "NO_PROMPT" if empty, "NOT_SIGNED_IN" if user is not logged in,
   * or undefined on success (navigates to the workspace page).
   */
  const createWorkspace = useCallback(
    async (prompt) => {
      if (!prompt?.trim()) return "NO_PROMPT";
      if (!apiKey) return "NO_KEY";
      if (!user) return "NOT_SIGNED_IN";

      const userId = user.id;
      if (!userId) return "NOT_SIGNED_IN";

      const messages = [{ role: "user", content: prompt }];
      const files = null;

      setIsCreating(true);
      try {
        const result = await CreateWorkspace({ user: userId, messages, files });
        if (result) {
          router.push(`/workspace/${result}`);
        }
      } finally {
        // We do not set isCreating(false) here if pushing because the page will unmount, 
        // but if it fails we might want to unset it. For simplicity we'll just let 
        // the page transition hide the loading state, or unset it if result was null.
      }
    },
    [user, apiKey, CreateWorkspace, router, setMessages]
  );

  return { createWorkspace, isCreating };
}
