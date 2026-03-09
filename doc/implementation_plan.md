# Codepilot System Completion Plan

This document outlines the detailed steps and feature roadmap for completing the Codepilot application. It is designed to be followed by another AI assistant to build a robust, production-ready, and portfolio-worthy application.

### Implementation Phases Overview
- **Phase 1**: Fix core code generation functionality and Sandpack viewer integration.
- **Phase 2**: Add UX polish, loading states, and export features.
- **Phase 3**: Refactor architecture, improve code quality, and add testing.

## Phase 1: Core Functionality Completion

The most critical issue in the current system is the broken loop between AI code generation and the Sandpack code viewer.

### Step 1.1: Fix the AI-to-Sandpack Data Flow
- **Modify `lib/gemini.js`**: Ensure `generateAI2` reliably returns parseable JSON. Currently, it returns the raw response object, but `CodeView.js` tries to access `result.text` and just logs it.
- **Update `components/Workspace/CodeView.js`**:
  - Parse the JSON response from `generateAI2`.
  - Extract the `files` object from the JSON.
  - Map the parsed files into the format expected by `SandpackProvider` (e.g., `{"/App.js": { "code": "..." }}`).
  - Call `setFiles(updatedFiles)` to render the new code in Sandpack.

### Step 1.2: Database Synchronization for Files
- **Sync Sandpack changes to Convex**: Whenever the code is modified by the user in the Sandpack editor or updated by the AI, it should trigger a debounce save to the Convex `workspaces` table under the `files` column.
- **Load files on mount**: In `Sidebar.js` or `CodeView.js`, when fetching the workspace data (`GetWorkspaceById`), properly populate the `files` state so the workspace is exactly as the user left it.

## Phase 2: Real-World UX & Polish

To make this application a portfolio centerpiece, the user experience must be flawless and responsive.

### Step 2.1: Implement Loading States
- Add a loading overlay or skeleton loader in `CodeView` while the AI is computing the code structure.
- Add a "typing..." indicator in the `Sidebar` chat history while waiting for the conversational response.

### Step 2.2: Implement File Export / Download
- Add a "Download Project" button in the `CodeView` or `Workspace` header.
- Use a library like `jszip` to bundle the current `files` object from Sandpack into a downloadable `.zip` file so users can take their code locally.

### Step 2.3: Error Handling and Toast Notifications
- Integrate a toast library like `sonner` or `react-hot-toast` (shadcn/ui has a toast component ready to use).
- Wrap AI API calls in `try/catch` and display meaningful error toasts if the API fails, rate limits occur, or JSON parsing fails.
- Disable input fields and buttons during loading states to prevent duplicate requests.

## Phase 3: Architecture & Best Practices Improvements

Showcase professional engineering standards.

### Step 3.1: Refactoring and Code Organization
- **Custom Hooks**: Extract the complex logic in `Sidebar.js` and `CodeView.js` into custom hooks (e.g., `useWorkspace(workspaceId)` and `useAIGeneration()`) to separate business logic from UI rendering.
- **Constants**: Move all hardcoded strings (like "gemini-2.0-flash") into `Lookup.js` or environment variables.

### Step 3.2: Type Safety and Linting
- Ensure all React components use Next.js (`eslint-config-next`) best practices.
- Add `PropTypes` or convert the codebase to TypeScript (`.ts` and `.tsx` files) to strictly define the shape of `messages` and `files`.

### Step 3.3: Security and Performance
- Ensure convex queries have proper row-level checks (e.g., a user can only fetch workspaces they created by verifying `user` matches the authenticated user context).

## Verification Plan

### Automated Tests
*Currently, there are no test runners configured.*
- Install `jest` and `@testing-library/react`.
- **Test 1**: Write a unit test for `components/Home/SignInDiaglog.jsx` to ensure it opens and closes based on props.
- **Test 2**: Write a test for `lib/gemini.js` that mocks `@google/genai` and validates the returned JSON structure.

### Manual Verification Steps
1. **End-to-End Core Loop**:
   - Go to `http://localhost:3000`.
   - Enter prompt: "Create a simple timer app".
   - Verify redirect to workspace.
   - Verify AI responds in sidebar chat.
   - Verify `CodeView` updates and Sandpack renders the functional timer app.
2. **Persistence Check**:
   - Refresh the workspace page. 
   - Verify that the chat history and the generated Sandpack code files load perfectly from the Convex database.
3. **Export Check**:
   - Click "Download". Verify a `.zip` file drops containing `package.json`, `App.js`, etc.
