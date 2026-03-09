import Lookup from "@/data/Lookup";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

// ─── Conversational AI (sidebar chat) ───────────────────────────────────────

// Non-streaming version (kept for compatibility / title generation)
async function generateAI(prompt) {
  const response = await ai.models.generateContent({
    model: Lookup.GEMINI_MODEL,
    contents: Lookup.AIPrompt + prompt,
  });
  return response.text;
}

// Streaming version — returns an async iterable of chunks.
// Usage: for await (const chunk of generateAIStream(prompt)) { chunk.text }
export function generateAIStream(prompt) {
  return ai.models.generateContentStream({
    model: Lookup.GEMINI_MODEL,
    contents: Lookup.AIPrompt + prompt,
  });
}

// ─── Code generation AI (Sandpack file tree) ────────────────────────────────

// context.files  — current Sandpack file map  { "/App.js": { code: "..." }, ... }
// context.messages — recent chat history       [{ role, content }, ...]
export async function generateAI2(prompt, context = {}) {
  const { files = {}, messages = [] } = context;

  // Serialize the existing file tree so the AI can make surgical edits.
  // Skip pure config / style files to keep the prompt concise.
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
            // Cap each file at 3 000 chars to avoid context overflow
            return `### ${path}\n\`\`\`\n${code.slice(0, 3000)}\n\`\`\``;
          })
          .join("\n\n")}`
      : "";

  // Include the last 6 chat turns so the AI understands the conversation arc
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
    model: Lookup.GEMINI_MODEL,
    contents: fullPrompt,
    config: { responseMimeType: "application/json" },
  });

  return response.text;
}

// ─── Workspace title generation ──────────────────────────────────────────────

export async function generateTitle(prompt) {
  const response = await ai.models.generateContent({
    model: Lookup.GEMINI_MODEL,
    contents: `Summarize the following app idea in 4 words or less. Return only the title, no punctuation, no quotes: "${prompt}"`,
  });
  return response.text.trim();
}

export default generateAI;
