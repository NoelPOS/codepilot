import Lookup from "@/data/Lookup";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

async function generateAI(prompt) {
  const customprompt = Lookup.AIPrompt + prompt;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: customprompt,
  });
  return response.text;
}

const ai2 = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

export async function generateAI2(prompt) {
  const customprompt = Lookup.AIPrompt2 + prompt;
  const response = await ai2.models.generateContent({
    model: "gemini-2.0-flash",
    contents: customprompt,
    config: {
      responseMimeType: "application/json",
      responseFormat: "json",
    },
  });

  return response;
}

export default generateAI;
