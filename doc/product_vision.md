# Codepilot Product Vision

This document answers core questions about what the Codepilot system is, what it does, and why it is a strong portfolio piece.

## What will our end product look like?
The end product will be a fully functional, browser-based AI coding assistant—essentially a lightweight, personal clone of Vercel's v0 or Bolt.new. 
A user can log in with their Google account, enter a prompt (e.g., "Create a modern To-Do app with a dark mode"), and the application will instantly generate the necessary React code, package dependencies, and render a live, working application right in their browser using the CodeSandbox Sandpack integration. 
Users can seamlessly iterate on the code through a conversational chat interface or by making direct edits. Finally, they can download the fully working code as a complete ZIP file project to their local machine.

## What are our features?
- **Google OAuth Authentication**: Secure, effortless login to personalize the experience and save user sessions.
- **AI-Powered Code Generation**: Intelligent project scaffolding and feature development using Google's Gemini 2.0 Flash (`@google/genai`).
- **Live In-Browser Preview**: A fully functional React runtime (via `@codesandbox/sandpack-react`) embedded in the workspace to instantly execute generated code without requiring a local environment.
- **Persistent Workspaces**: Every prompt creates a new project stored in a real-time Convex database, allowing users to revisit past projects and review their iterative chat history.
- **Iterative Chat Interface**: Users converse with the AI to refine, tweak, or debug the generated application on the fly.
- **Code Export**: Download the generated project as a ZIP file to your local machine for production deployment or further development.

## What is the good thing about our system?
- **Portfolio-Ready Architecture**: It demonstrates an end-to-end understanding of full-stack development, integrating cutting-edge Large Language Models (LLMs) with complex real-time browser code execution. This is a highly sought-after capability.
- **Zero-Setup for Users**: It removes friction entirely. Users don't need to install Node.js, configure Webpack, or clone repositories. They just type what they want, and it runs immediately.
- **Modern Tech Stack**: By utilizing Next.js 15 (App Router), React 19, Tailwind CSS, and Convex for low-latency serverless data synchronization, you are proving your ability to work with the latest, highly scalable, and modern ecosystem tools.
- **Clear Separation of Concerns**: The architecture properly splits the conversational flow (sidebar chat) from the structured code-generation flow (Sandpack editor viewer), keeping the AI context and UI clean, robust, and easy to scale.


Additional Features Worth Building
High-impact (core product)
1. Workspace history / dashboard
A /dashboard page listing all the user's past workspaces with titles, previews, and timestamps. Right now workspaces are only accessible if you know the URL. This is a major UX gap.

2. Fork / remix a workspace
"Start from this" — duplicates a workspace so the user can iterate in a new branch without losing the original. Very useful for experimenting.

3. Streaming AI responses
Instead of waiting 5–10 seconds for the full response, stream tokens into the sidebar chat as they arrive. Gemini supports streaming via generateContentStream. Makes the product feel dramatically faster.

4. Multi-file chat context
Right now generateAI2 only receives the last user prompt. Passing the full file tree + recent chat history as context lets the AI make surgical edits to existing code rather than rewriting everything from scratch.

5. Framework selector
Let users choose: React (current), Vue, Vanilla JS, or even a Next.js template. Sandpack supports all of these templates natively.

UX / Polish
6. Workspace title auto-generation
Call Gemini with a one-shot prompt ("Summarize this in 5 words") to auto-name the workspace from the first prompt. Saves the user having to name things manually.

7. Dark/light mode for Sandpack
Already have next-themes installed — just wire the Sandpack theme prop to match the app theme.

8. Shareable preview links
Generate a read-only URL (/preview/[id]) that shows just the Sandpack preview without the editor. Great for sharing results.

9. In-editor file creation/deletion
Sandpack supports useActiveCode and useSandpack hooks — expose a UI to add/remove files manually, not just via AI.

Monetization boosters
10. Usage dashboard
Show users how many tokens/prompts they've used this month vs their limit, with a progress bar and an upsell CTA when they're near the cap.

11. Referral system
"Invite a friend, get 50 extra prompts" — simple but effective for growth. Store a referralCode on the user and credit both sides on signup.

12. Prompt templates / marketplace
Pre-built prompt starters ("E-commerce store", "SaaS dashboard", "Portfolio site") that users can fork. Could also be user-submitted, creating a community loop.

Recommended Build Order
If you want to start executing on these, here's the priority order that delivers the most value fastest:

Token tracking + enforcement (prerequisite for everything else)
Workspace dashboard (massive UX gap right now)
Stripe integration (Free → Pro gate)
Streaming AI responses (biggest perceived performance win)
Workspace title generation (small, high-polish touch)
Shareable preview links (viral/growth mechanic)
Want me to start implementing any of these? I'd suggest 