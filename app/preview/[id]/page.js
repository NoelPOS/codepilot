"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SandpackPreview, SandpackProvider, SandpackLayout } from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2Icon, ExternalLink, Code2 } from "lucide-react";

export default function PreviewPage() {
  const { id } = useParams();

  const workspace = useQuery(api.workspace.GetWorkspaceById, { id });

  if (workspace === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2Icon className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (workspace === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p className="text-lg font-medium">Project not found</p>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    );
  }

  const files = workspace.files || Lookup.DEFAULT_FILE;
  const title = workspace.title || workspace.messages?.[0]?.content?.slice(0, 40) || "Preview";

  return (
    <div className="flex flex-col h-screen">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm truncate max-w-xs">{title}</span>
          <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
            Read-only preview
          </span>
        </div>

        <Link href={`/workspace/${id}`}>
          <Button size="sm" className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Editor
          </Button>
        </Link>
      </div>

      {/* Full-height Sandpack preview, no editor */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          files={files}
          theme="dark"
          template="react"
          customSetup={{
            dependencies: { ...Lookup.DEPENDANCY },
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        >
          <SandpackLayout className="!border-none !h-full">
            <SandpackPreview
              style={{ height: "100%", width: "100%" }}
              showNavigator
              showRefreshButton
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
