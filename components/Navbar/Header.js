"use client";

import React, { useContext } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "./toggle-theme-button";
import { UserContext } from "@/context/UserContext";

import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log(tokenResponse);
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: "Bearer " + tokenResponse.access_token } }
      );
      // console.log(userInfo);
      setUser(userInfo.data);
      const user = await createUser({
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture,
        uid: uuid4(),
      });
      console.log("Before creation:", user);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("created user", user);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });
  return (
    <div>
      <header className="flex justify-between px-10 py-5">
        <div>LOGO</div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage className="rounded-full" src={user?.picture} />
                <AvatarFallback className="rounded-full">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="outline"
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem("user");
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => googleLogin()}>
              Sign In
            </Button>
          )}
          <ModeToggle />
        </div>
      </header>
    </div>
  );
};
