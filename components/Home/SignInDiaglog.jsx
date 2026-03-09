import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React from "react";
import { Button } from "../ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export const SignInDiaglog = ({ open, onOpenChange }) => {
  const { login: googleLogin } = useGoogleAuth({
    onSuccess: () => onOpenChange(false),
  });
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Sign in first so you can start building website!
            </DialogTitle>

            <DialogDescription className={"flex flex-col gap-4 justify-center"}>
              <p className="text-gray-500">
                Sign in to your account to access all features and save your
                progress.
              </p>
              <Button onClick={() => googleLogin()} className="w-full">
                Sign in with Google
              </Button>
              <p>
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
