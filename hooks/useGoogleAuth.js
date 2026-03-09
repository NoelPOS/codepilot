"use client";

import { useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation } from "convex/react";
import axios from "axios";
import uuid4 from "uuid4";
import { api } from "@/convex/_generated/api";
import { UserContext } from "@/context/UserContext";
import Lookup from "@/data/Lookup";

/**
 * useGoogleAuth — reusable Google OAuth login hook.
 *
 * Consolidates the login flow that was previously duplicated in
 * Header.js and SignInDiaglog.jsx:
 *   Google OAuth → fetch user info → upsert in Convex → persist to context + localStorage.
 *
 * @param {object}   options
 * @param {function} options.onSuccess  Optional callback called after successful login.
 * @param {function} options.onError    Optional callback called on login error.
 * @returns {{ login: function }}       Call `login()` to start the Google OAuth flow.
 */
export function useGoogleAuth({ onSuccess, onError } = {}) {
  const { setUser } = useContext(UserContext);
  const createUser = useMutation(api.user.createUser);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(Lookup.GOOGLE_USERINFO_URL, {
        headers: { Authorization: "Bearer " + tokenResponse.access_token },
      });

      // createUser returns the Convex _id (upsert: existing or newly created)
      const convexId = await createUser({
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture,
        uid: uuid4(),
      });

      const storedUser = { ...userInfo.data, id: convexId };
      setUser(storedUser);
      localStorage.setItem("user", JSON.stringify(storedUser));

      onSuccess?.(storedUser);
    },
    onError: (err) => {
      console.error("Google login error:", err);
      onError?.(err);
    },
  });

  return { login };
}
