# Codepilot System Overview

## Application Architecture
Codepilot is an AI-powered code generation and execution workspace, built with a modern web stack:
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend/Database**: Convex (real-time database and serverless functions).
- **Authentication**: Google OAuth (`@react-oauth/google`).
- **Code Execution**: CodeSandbox Sandpack (`@codesandbox/sandpack-react`) for in-browser React execution.
- **AI Integration**: Google Gemini (`@google/genai`) for conversational understanding and code generation.

## Current System Flow
1. **Landing Page (`/app/page.js`)**: Users are greeted and can enter a prompt.
2. **Authentication (`SignInDiaglog.jsx`)**: If not signed in, users are prompted to authenticate via Google. User records are stored in Convex (`users` table).
3. **Workspace Creation**: Upon entering a prompt, a new `workspace` record is created in Convex containing the initial message, and the user is redirected to `/workspace/[id]`.
4. **Workspace UI (`/app/workspace/[id]/page.js`)**:
   - **Sidebar**: Displays the chat history using `react-markdown`. Users can send additional prompts which update the local React Context and the Convex DB. It automatically triggers 'user' messages to be processed by Gemini (via `generateAI`), which responds with conversational text.
   - **CodeView**: Renders a Sandpack environment. Currently, it listens for 'assistant' messages and triggers a second AI call (`generateAI2`) intended to generate the JSON structure representing the files for Sandpack. 

## Identified Gaps & Incomplete Features
While the UI foundation and API integrations are present, the system is functionally incomplete for real-world use:
1. **Broken Code Generation Loop**: 
   - `CodeView.js` calls Gemini to generate code but only `console.log`s the result. It **fails to parse the AI's JSON output and update Sandpack's `files` state**, leaving the editor empty (only showing default template files).
   - The Convex workspace DB schema allows storing `files`, but this is currently not being synced from or to the `CodeView` component.
2. **Missing UI/UX Polish**:
   - Lack of loading state indicators when waiting for Gemini to respond.
   - No way to export, download, or share the generated code.
   - Code editor does not reflect ongoing AI stream generation (no streaming implemented).
3. **Robustness & Error Handling**:
   - Error states (e.g., API failures, rate viewing) are not handled gracefully.
   - The application does not handle prompt context-window limits gracefully if chat histories become too long.
