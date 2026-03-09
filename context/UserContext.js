import { createContext } from "react";

/**
 * UserContext — shares the authenticated user object across the component tree.
 *
 * Default value throws on access without a provider, making setup errors
 * obvious instead of silently returning `undefined`.
 */
const noProvider = () => {
  throw new Error("UserContext used outside of its Provider");
};

export const UserContext = createContext({
  user: undefined,
  setUser: noProvider,
});
