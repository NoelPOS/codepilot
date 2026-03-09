import Lookup from "@/data/Lookup";
import { GoogleGenAI } from "@google/genai";

/**
 * AI Service Abstraction Layer — BYOK (Bring Your Own Key) Pattern
 *
 * This module wraps the concrete AI implementation (currently Google Gemini)
 * behind a unified interface. All hooks and components should import from
 * this module instead of directly from vendor-specific libraries.
 *
 * BYOK: The user's Gemini API key is stored in their browser (localStorage)
 * and passed per-call. CodePilot never stores or proxies API keys — calls
 * go directly from the user's browser to Gemini using their own quota.
 *
 * To swap out the AI provider (e.g., to OpenAI, Anthropic), you only
 * need to change this file — the rest of the app stays the same.
 */

// ─── Provider Configuration ─────────────────────────────────────────────────

const model = Lookup.GEMINI_MODEL;

/** Creates a Gemini client using the caller's API key. */
function getClient(apiKey) {
  return new GoogleGenAI({ apiKey });
}

// ─── Public API (Strategy Interface) ─────────────────────────────────────────

/**
 * Generate a chat response (non-streaming).
 * @param {string} prompt   The user's message.
 * @param {string} apiKey   The caller's Gemini API key.
 * @returns {Promise<string>}  The AI's response text.
 */
export async function generate(prompt, apiKey) {
  const ai = getClient(apiKey);
  const response = await ai.models.generateContent({
    model,
    contents: Lookup.AIPrompt + prompt,
  });
  return response.text;
}

/**
 * Generate a chat response as a stream of chunks.
 * @param {string} prompt   The user's message.
 * @param {string} apiKey   The caller's Gemini API key.
 * @returns  An async iterable of chunks — each chunk has a `.text` property.
 */
export function stream(prompt, apiKey) {
  const ai = getClient(apiKey);
  return ai.models.generateContentStream({
    model,
    contents: Lookup.AIPrompt + prompt,
  });
}

/**
 * Generate code (Sandpack file tree) from a user prompt + existing context.
 *
 * @param {string} prompt              The user's request.
 * @param {object} context
 * @param {object} context.files       Current Sandpack file map.
 * @param {Array}  context.messages    Recent chat history.
 * @param {string} apiKey              The caller's Gemini API key.
 * @returns {Promise<string>}          Raw JSON string with the file tree.
 */
export async function generateCode(prompt, context = {}, apiKey) {
  const ai = getClient(apiKey);
  const { files = {}, messages = [] } = context;

  // Serialize the existing file tree for surgical edits
  const codeFiles = Object.entries(files).filter(
    ([path]) =>
      !path.endsWith(".css") &&
      !path.endsWith(".html") &&
      !path.includes("config") &&
      !path.includes("postcss")
  );

  const fileContext =
    codeFiles.length > 0
      ? `CURRENT PROJECT FILES:\n${codeFiles
          .map(([path, file]) => {
            const code = typeof file === "string" ? file : file.code;
            return `### ${path}\n\`\`\`\n${code.slice(0, 3000)}\n\`\`\``;
          })
          .join("\n\n")}`
      : "";

  const chatContext =
    messages.length > 0
      ? `RECENT CONVERSATION:\n${messages
          .slice(-6)
          .map(
            (m) =>
              `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 300)}`
          )
          .join("\n")}`
      : "";

  const contextBlock = [fileContext, chatContext].filter(Boolean).join("\n\n");

  const fullPrompt =
    Lookup.AIPrompt2 +
    (contextBlock ? `\n\nCONTEXT:\n${contextBlock}\n\n` : "") +
    `USER REQUEST: ${prompt}`;

  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt,
    config: { responseMimeType: "application/json" },
  });

  return response.text;
}

/**
 * Generate a short workspace title from a user prompt.
 * @param {string} prompt   The user's original prompt.
 * @param {string} apiKey   The caller's Gemini API key.
 * @returns {Promise<string>}  A 4-word-or-less title.
 */
export async function generateTitle(prompt, apiKey) {
  const ai = getClient(apiKey);
  const response = await ai.models.generateContent({
    model,
    contents: `Summarize the following app idea in 4 words or less. Return only the title, no punctuation, no quotes: "${prompt}"`,
  });
  return response.text.trim();
}
