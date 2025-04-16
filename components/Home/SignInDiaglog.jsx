import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import React, { useContext, useEffect } from "react";
import { Button } from "../ui/button";
import { UserContext } from "@/context/UserContext";
import { useMutation } from "convex/react";
import uuid4 from "uuid4";
import { api } from "@/convex/_generated/api";

export const SignInDiaglog = ({ open, onOpenChange }) => {
  const { user, setUser } = useContext(UserContext);
  const createUser = useMutation(api.user.createUser);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log(tokenResponse);
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: "Bearer " + tokenResponse.access_token } }
      );
      setUser(userInfo.data);
      onOpenChange(false);

      const user = await createUser({
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture,
        uid: uuid4(),
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userInfo.data,
          id: user,
        })
      );
    },
    onError: (errorResponse) => console.log(errorResponse),
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
