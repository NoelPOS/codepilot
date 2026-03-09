"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, KeyRound } from "lucide-react";

/**
 * ApiKeyDialog — prompts the user to enter their own Gemini API key.
 *
 * The key is stored in localStorage only; it is never sent to CodePilot's
 * backend. Calls to Gemini are made directly from the browser using the
 * user's own quota (BYOK pattern).
 */
export function ApiKeyDialog({ open, onOpenChange, onSave, existingKey }) {
  const [value, setValue] = useState(existingKey ? "••••••••••••••••" : "");
  const [isEditing, setIsEditing] = useState(!existingKey);

  const handleSave = () => {
    if (!value.trim() || value.startsWith("•")) return;
    onSave(value.trim());
    onOpenChange(false);
  };

  const handleEdit = () => {
    setValue("");
    setIsEditing(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            CodePilot uses your own Gemini API key. It is stored only in your
            browser and never sent to our servers — you control your own quota.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Your API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIza..."
                value={value}
                disabled={!isEditing}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus={isEditing}
              />
              {existingKey && !isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  Change
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Get a free key from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
            . The free tier gives you 1,500 requests/day at no cost.
          </p>

          {isEditing && (
            <Button onClick={handleSave} disabled={!value.trim() || value.startsWith("•")}>
              Save Key & Continue
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
