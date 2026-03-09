"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { PromptContext } from "@/context/PromptContext";
import { generateCode as generateAI2 } from "@/lib/ai";
import { useApiKey } from "@/hooks/useApiKey";
import { toast } from "sonner";

/**
 * useCodeGeneration — manages AI code generation and Sandpack file sync.
 *
 * Extracted from CodeView.js so the business-logic can be tested and
 * reused independently of the Sandpack rendering layer.
 *
 * @returns  isGenerating state, sandpackFiles, downloadProject, sharePreview helpers.
 */
export function useCodeGeneration() {
  const workspaceId = useParams().id;
  const { messages, files: contextFiles, setFiles } = useContext(PromptContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const initialMsgCount = useRef(null);
  const { apiKey } = useApiKey();

  const UpdateWorkspace = useMutation(api.workspace.UpdateWorkspace);

  // Track how many messages existed on load so we don't re-generate on restore
  useEffect(() => {
    if (!messages) return;
    if (initialMsgCount.current === null) {
      initialMsgCount.current = messages.length;
      return;
    }

    // Only trigger for messages added after the initial load
    if (messages.length <= initialMsgCount.current) return;
    if (messages[messages.length - 1]?.role !== "assistant") return;

    const generateCode = async () => {
      setIsGenerating(true);
      try {
        const userPrompt = messages[messages.length - 2]?.content;
        if (!userPrompt) return;

        const rawResult = await generateAI2(userPrompt, {
          files: contextFiles || {},
          messages: messages.slice(-8),
        }, apiKey);

        const parsed = JSON.parse(rawResult);

        if (!parsed.files) {
          toast.error("AI returned an unexpected format. Please try again.");
          return;
        }

        // Safety net: normalize paths Gemini sometimes gets wrong.
        // Strip /src/ prefix and drop infrastructure files that must not be overwritten.
        const PROTECTED = new Set(["/index.js", "/public/index.html"]);
        const normalizedFiles = {};
        for (const [path, value] of Object.entries(parsed.files)) {
          const normalized = ("/" + path.replace(/^\/?(src\/)?/, "")).replace(/\/+/g, "/");
          if (!PROTECTED.has(normalized)) {
            normalizedFiles[normalized] = value;
          }
        }

        setFiles(normalizedFiles);
        await UpdateWorkspace({ id: workspaceId, files: normalizedFiles });
      } catch (error) {
        console.error("Code generation error:", error);
        
        if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
          toast.error("Rate limit exceeded. Please wait a minute before prompting again.");
        } else {
          toast.error("Failed to generate code. Please try again.");
        }
      } finally {
        setIsGenerating(false);
      }
    };

    generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Download project as ZIP ──────────────────────────────────────
  const downloadProject = async (sandpackFiles) => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      Object.entries(sandpackFiles).forEach(([path, file]) => {
        const code = typeof file === "string" ? file : file.code;
        zip.file(path.replace(/^\//, ""), code);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download project.");
    }
  };

  // ── Copy a shareable preview URL ─────────────────────────────────
  const sharePreview = () => {
    const url = `${window.location.origin}/preview/${workspaceId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Preview link copied to clipboard!"))
      .catch(() => toast.error("Could not copy link."));
  };

  return {
    isGenerating,
    contextFiles,
    downloadProject,
    sharePreview,
  };
}
