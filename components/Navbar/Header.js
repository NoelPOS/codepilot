"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "./toggle-theme-button";
import { UserContext } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { KeyRound, LayoutDashboard, Check } from "lucide-react";
import { ApiKeyDialog } from "@/components/Home/ApiKeyDialog";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useApiKey } from "@/hooks/useApiKey";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const { apiKey, saveApiKey } = useApiKey();

  const { login: googleLogin } = useGoogleAuth();

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <>
      <header className="flex justify-between items-center px-10 py-4 border-b border-gray-200 dark:border-gray-800">
        {/* Logo / Brand */}
        <Link href="/" className="font-bold text-xl tracking-tight">
          CodePilot
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              {/* API Key button */}
              <Button
                variant={apiKey ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 transition-all duration-300 ${apiKey ? "bg-green-600 hover:bg-green-700 text-white border-none" : ""}`}
                onClick={() => setShowKeyDialog(true)}
              >
                {apiKey ? <Check className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
                {apiKey ? "Key Active" : "Add API Key"}
              </Button>

              <Avatar className="w-8 h-8">
                <AvatarImage className="rounded-full" src={user?.picture} />
                <AvatarFallback className="rounded-full bg-gray-200 text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => googleLogin()}>
              Sign In
            </Button>
          )}

          <ModeToggle />
        </div>
      </header>

      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        onSave={saveApiKey}
        existingKey={apiKey}
      />
    </>
  );
};
