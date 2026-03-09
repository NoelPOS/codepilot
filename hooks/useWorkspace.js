"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PromptContext } from "@/context/PromptContext";
import { UserContext } from "@/context/UserContext";
import { stream as generateAIStream, generateTitle } from "@/lib/ai";
import { useApiKey } from "@/hooks/useApiKey";
import { toast } from "sonner";
import Lookup from "@/data/Lookup";

/**
 * useWorkspace — manages workspace state, chat streaming, and persistence.
 *
 * Extracted from Sidebar.js so the business-logic can be tested and
 * reused independently of the UI that renders it.
 *
 * @param {string} workspaceId  Convex document ID for the workspace.
 * @returns  All state and helpers the Sidebar UI needs.
 */
export function useWorkspace(workspaceId) {
  const convex = useConvex();
  const { user } = useContext(UserContext);
  const { messages, setMessages, setFiles } = useContext(PromptContext);
  const { apiKey } = useApiKey();

  const [isLoading, setIsLoading] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState(null);

  const messagesEndRef = useRef(null);
  const streamTriggeredRef = useRef(0);


  const UpdateWorkspace = useMutation(api.workspace.UpdateWorkspace);
  const incrementUsage = useMutation(api.user.incrementUsage);

  // ── Reactive user data (plan + usage) ────────────────────────────
  const userData = useQuery(
    api.user.getUserById,
    user?.id ? { userId: user.id } : "skip"
  );

  const plan = userData?.plan ?? "free";
  const planLimits = Lookup.PLANS[plan];
  const promptsUsed = userData?.promptsUsed ?? 0;
  const usagePercent = Math.min(
    100,
    (promptsUsed / planLimits.promptLimit) * 100
  );

  // ── Auto-scroll to bottom ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Load workspace on mount ──────────────────────────────────────
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const workspace = await convex.query(api.workspace.GetWorkspaceById, {
          id: workspaceId,
        });
        if (!workspace) {
          toast.error("Workspace not found");
          return;
        }
        setMessages(workspace.messages || []);
        if (workspace.files) setFiles(workspace.files);
        if (workspace.title) setWorkspaceTitle(workspace.title);
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace");
      }
    };

    fetchWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // ── Stream AI response when last message is from user ────────────
  useEffect(() => {
    const streamResponse = async () => {
      if (!messages || messages.length === 0) return;
      if (messages[messages.length - 1]?.role !== "user") return;
      if (messages.length === streamTriggeredRef.current) return;

      streamTriggeredRef.current = messages.length;
      setIsLoading(true);
      let fullContent = "";

      try {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        const stream = await generateAIStream(messages[messages.length - 1].content, apiKey);

        for await (const chunk of stream) {
          if (chunk.text) {
            fullContent += chunk.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: fullContent,
              };
              return updated;
            });
          }
        }

        if (fullContent) {
          const finalMessages = [
            ...messages,
            { role: "assistant", content: fullContent },
          ];
          await UpdateWorkspace({ id: workspaceId, messages: finalMessages });

          // Auto-generate a workspace title from the very first prompt
          if (messages.length === 1 && !workspaceTitle) {
            generateTitle(messages[0].content, apiKey)
              .then((title) => {
                if (title) {
                  setWorkspaceTitle(title);
                  UpdateWorkspace({ id: workspaceId, title });
                }
              })
              .catch((err) => console.warn("Title generation failed:", err)); // non-critical
          }
        }
      } catch (error) {
        console.error("AI stream error:", error);
        
        if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
          toast.error("Rate limit exceeded. Please wait a minute before prompting again.");
        } else {
          toast.error("Failed to get AI response. Please try again.");
        }

        setMessages((prev) => {
          if (prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    };

    streamResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Send a user prompt ───────────────────────────────────────────
  const sendPrompt = useCallback(
    async (prompt) => {
      if (!prompt.trim() || isLoading) return;

      if (!apiKey) {
        return "NO_KEY";
      }

      const newMessage = { role: "user", content: prompt };
      setMessages((prev) => [...prev, newMessage]);
      await UpdateWorkspace({
        id: workspaceId,
        messages: [...(messages || []), newMessage],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, messages, apiKey, workspaceId]
  );

  return {
    // State
    messages,
    isLoading,
    workspaceTitle,
    apiKey,
    messagesEndRef,

    // Actions
    sendPrompt,
  };
}
