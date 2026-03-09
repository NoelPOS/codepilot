"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2Icon } from "lucide-react";
import Lookup from "@/data/Lookup";
import { useContext, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { SignInDiaglog } from "@/components/Home/SignInDiaglog";
import { useCreateWorkspace } from "@/hooks/useCreateWorkspace";
import { ApiKeyDialog } from "@/components/Home/ApiKeyDialog";
import { useApiKey } from "@/hooks/useApiKey";

export default function Home() {
  const [userprompt, setUserPrompt] = useState("");
  const { user } = useContext(UserContext);
  const [showDialog, setShowDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const { apiKey, saveApiKey } = useApiKey();

  const { createWorkspace, isCreating } = useCreateWorkspace();

  const executePrompt = async (prompt) => {
    const result = await createWorkspace(prompt);

    if (result === "NO_PROMPT") {
      alert("Please enter a prompt");
    } else if (result === "NO_KEY") {
      setShowKeyDialog(true);
    } else if (result === "NOT_SIGNED_IN") {
      setShowDialog(true);
    } else {
      setUserPrompt("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-12">
      <div className="max-w-3xl w-full flex flex-col gap-6">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {Lookup.HERO_HEADING}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {Lookup.HERO_DESC}
          </p>
        </div>

        {/* Prompt input */}
        <div className="relative shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <Textarea
            className="min-h-[100px] max-h-[240px] pr-12 resize-none border-0 shadow-none focus-visible:ring-0 bg-white dark:bg-gray-950 px-4 py-3 text-sm disabled:opacity-50"
            placeholder={Lookup.INPUT_PLACEHOLDER}
            value={userprompt}
            disabled={isCreating}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                executePrompt(userprompt);
              }
            }}
          />
          <Button
            className="absolute bottom-2 right-2 rounded-lg"
            size="icon"
            disabled={!userprompt.trim() || isCreating}
            onClick={() => executePrompt(userprompt)}
          >
            {isCreating ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Starter template picker */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3 text-center">
            Or start from a template
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Lookup.STARTER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => executePrompt(tpl.prompt)}
                disabled={isCreating}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:border-blue-400 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors mb-1 shadow-sm">
                  <tpl.icon className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tpl.label}
                </span>
                <span className="text-xs text-gray-400 leading-tight">
                  {tpl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <SignInDiaglog open={showDialog} onOpenChange={setShowDialog} />
      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        onSave={(key) => {
          saveApiKey(key);
          setShowKeyDialog(false);
        }}
        existingKey={apiKey}
      />
    </div>
  );
}
