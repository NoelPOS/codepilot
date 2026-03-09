/**
 * Unit tests for lib/gemini.js
 *
 * Strategy: mock `@google/genai` so no real API calls are made.
 * We verify that:
 *  1. The correct model name is passed.
 *  2. The prompt includes the system prompt from Lookup.
 *  3. generateAI2 returns the text property from the model response.
 */

// ── Mock the Google GenAI SDK ─────────────────────────────────────────────────

const mockGenerateContent = jest.fn();
const mockGenerateContentStream = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream,
    },
  })),
}));

// ── Mock Lookup so tests don't depend on prompt wording ───────────────────────

jest.mock("@/data/Lookup", () => ({
  __esModule: true,
  default: {
    AIPrompt: "SYSTEM_CHAT_PROMPT: ",
    AIPrompt2: "SYSTEM_CODE_PROMPT: ",
    GEMINI_MODEL: "gemini-2.0-flash",
  },
}));

// ── Import after mocks are registered ─────────────────────────────────────────

const generateAI = require("@/lib/gemini").default;
const { generateAI2, generateTitle } = require("@/lib/gemini");

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("generateAI (conversational)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls the Gemini API with the correct model and prompt", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Hello from AI" });

    const result = await generateAI("Build a to-do app");

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe("gemini-2.0-flash");
    expect(callArgs.contents).toContain("SYSTEM_CHAT_PROMPT: ");
    expect(callArgs.contents).toContain("Build a to-do app");
    expect(result).toBe("Hello from AI");
  });
});

describe("generateAI2 (code generation)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns parseable JSON text from the model", async () => {
    const fakeJson = JSON.stringify({
      projectTitle: "Timer",
      explanation: "A timer app",
      files: { "/App.js": { code: "export default App;" } },
      generatedFiles: ["/App.js"],
    });

    mockGenerateContent.mockResolvedValue({ text: fakeJson });

    const result = await generateAI2("Create a timer app");

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];

    // Verify model
    expect(callArgs.model).toBe("gemini-2.0-flash");
    // Verify it requested JSON format
    expect(callArgs.config.responseMimeType).toBe("application/json");
    // Verify the prompt includes the system code prompt
    expect(callArgs.contents).toContain("SYSTEM_CODE_PROMPT: ");
    // Verify the user request is embedded
    expect(callArgs.contents).toContain("Create a timer app");

    // The result should be valid JSON
    const parsed = JSON.parse(result);
    expect(parsed.files).toBeDefined();
    expect(parsed.files["/App.js"]).toBeDefined();
  });

  it("includes existing file context when provided", async () => {
    mockGenerateContent.mockResolvedValue({ text: "{}" });

    await generateAI2("Add a button", {
      files: { "/App.js": { code: "export default App;" } },
      messages: [{ role: "user", content: "hello" }],
    });

    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain("CURRENT PROJECT FILES:");
    expect(callArgs.contents).toContain("/App.js");
    expect(callArgs.contents).toContain("RECENT CONVERSATION:");
  });
});

describe("generateTitle", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a trimmed title string", async () => {
    mockGenerateContent.mockResolvedValue({ text: "  Simple Timer App  " });

    const title = await generateTitle("Build a countdown timer");

    expect(title).toBe("Simple Timer App");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
