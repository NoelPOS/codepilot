import { createContext } from "react";

/**
 * PromptContext — shares the current prompt messages and generated files
 * across the component tree.
 *
 * Default value throws on access without a provider, making setup errors
 * obvious instead of silently returning `undefined`.
 */
const noProvider = () => {
  throw new Error("PromptContext used outside of its Provider");
};

export const PromptContext = createContext({
  messages: undefined,
  setMessages: noProvider,
  files: null,
  setFiles: noProvider,
});
