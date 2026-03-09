/**
 * Unit tests for the downloadProject utility in useCodeGeneration.
 *
 * Strategy: test the ZIP bundling logic in isolation by extracting
 * the download logic and mocking jszip + DOM APIs.
 */

import "@testing-library/jest-dom";

// ── Mock jszip ────────────────────────────────────────────────────────────────

const mockFile = jest.fn();
const mockGenerateAsync = jest.fn();

jest.mock("jszip", () =>
  jest.fn().mockImplementation(() => ({
    file: mockFile,
    generateAsync: mockGenerateAsync,
  }))
);

// ── Download helper (extracted logic, mirrors useCodeGeneration) ──────────────

async function downloadProject(sandpackFiles) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  Object.entries(sandpackFiles).forEach(([path, file]) => {
    const code = typeof file === "string" ? file : file.code;
    zip.file(path.replace(/^\//, ""), code);
  });

  return zip.generateAsync({ type: "blob" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("downloadProject (ZIP export)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateAsync.mockResolvedValue(new Blob(["zip-content"]));
  });

  it("adds all files to the ZIP with paths stripped of leading slash", async () => {
    const files = {
      "/App.js": { code: 'export default function App() { return <h1>Hi</h1>; }' },
      "/index.css": { code: "body { margin: 0; }" },
      "/public/index.html": { code: "<html></html>" },
    };

    await downloadProject(files);

    expect(mockFile).toHaveBeenCalledTimes(3);
    expect(mockFile).toHaveBeenCalledWith(
      "App.js",
      'export default function App() { return <h1>Hi</h1>; }'
    );
    expect(mockFile).toHaveBeenCalledWith("index.css", "body { margin: 0; }");
    expect(mockFile).toHaveBeenCalledWith("public/index.html", "<html></html>");
  });

  it("handles files provided as plain strings", async () => {
    const files = {
      "/README.md": "# Hello",
    };

    await downloadProject(files);

    expect(mockFile).toHaveBeenCalledWith("README.md", "# Hello");
  });

  it("calls generateAsync with blob type", async () => {
    await downloadProject({ "/App.js": { code: "hi" } });

    expect(mockGenerateAsync).toHaveBeenCalledWith({ type: "blob" });
  });
});
