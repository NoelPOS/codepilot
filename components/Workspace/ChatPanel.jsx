"use client";

import { UserContext } from "@/context/UserContext";
import { Lightbulb, Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ApiKeyDialog } from "@/components/Home/ApiKeyDialog";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useApiKey } from "@/hooks/useApiKey";
import ChatMessage from "./ChatMessage";

const ChatPanel = ({ layoutMode }) => {
  const workspaceId = useParams().id;
  const { user } = useContext(UserContext);
  const [userprompt, setUserPrompt] = useState("");
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const { apiKey, saveApiKey } = useApiKey();

  const {
    messages,
    isLoading,
    messagesEndRef,
    sendPrompt,
  } = useWorkspace(workspaceId);

  const executePrompt = async (prompt) => {
    const result = await sendPrompt(prompt);
    if (result === "NO_KEY") {
      setShowKeyDialog(true);
    }
    setUserPrompt("");
  };

  const isFloating = layoutMode === "floating";

  return (
    <>
      <div 
        className={
          isFloating
            ? "absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl flex flex-col p-4 bg-background/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl z-50 transition-all duration-300 ease-in-out"
            : "flex flex-col w-full h-[30vh] shrink-0 p-4 border-t border-gray-200 dark:border-gray-800"
        }
      >
        {/* Messages */}
        <div
          className={`overflow-y-auto mb-3 scrollbar-hide flex-1 ${isFloating ? "max-h-[30vh]" : ""}`}
        >
          {messages && messages.length > 0 ? (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  userPicture={user?.picture}
                />
              ))}

              {/* "Thinking…" shows only until the first streaming chunk arrives */}
              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2Icon className="animate-spin w-4 h-4" />
                      Thinking...
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center text-gray-400 text-sm mt-2">
              No messages yet. Start with a prompt!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Usage area */}
        <div className="relative flex flex-col gap-2">
          {/* No API key nudge */}
          {!apiKey && (
            <p className="text-xs text-center text-amber-500 px-1">
              Add your{" "}
              <button
                className="underline font-medium"
                onClick={() => setShowKeyDialog(true)}
              >
                Gemini API key
              </button>{" "}
              to start generating.
            </p>
          )}

          <div className="relative shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800/60 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <Textarea
              className="min-h-[60px] max-h-[120px] pr-12 resize-none border-0 shadow-none focus-visible:ring-0 rounded-none bg-white dark:bg-gray-950 px-4 py-3 text-sm"
              placeholder="Enter your prompt here..."
              value={userprompt}
              disabled={isLoading}
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
              disabled={isLoading || !userprompt.trim()}
              onClick={() => executePrompt(userprompt)}
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin w-4 h-4" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        onSave={saveApiKey}
        existingKey={apiKey}
      />
    </>
  );
};

export default ChatPanel;
