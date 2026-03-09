# Architecture Decisions & Technology Rationale

This document explains **why** each technology and architectural pattern was chosen for Codepilot. It is designed to help you articulate these decisions in interviews, portfolio reviews, or technical presentations.

---

## Why Next.js 15 (App Router)?

**Alternatives considered:** Vite + React SPA, Remix, plain Create React App

| Reason | Detail |
|---|---|
| **Server & Client in one** | Next.js lets us define API routes (`app/api/stripe/*`) alongside our frontend pages — no need for a separate Express/Fastify backend server. |
| **App Router (v13+)** | The newer App Router uses React Server Components by default, giving us fine-grained control over what runs on the server vs. client. This is a must-know for modern React roles. |
| **File-based routing** | Routes like `/workspace/[id]` and `/dashboard` are defined by folder structure, eliminating boilerplate router configuration. |
| **Built-in optimizations** | `next/image` (lazy loading, WebP conversion), `next/font` (zero layout shift), and automatic code-splitting come free. |
| **Deployment** | One-click deploy to Vercel with automatic preview URLs for every PR — ideal for a portfolio project. |

**Why not a plain Vite SPA?** We need server-side API routes for Stripe webhooks and checkout sessions. A pure SPA would have required a separate backend.

---

## Why Convex (Real-Time Database)?

**Alternatives considered:** Firebase/Firestore, Supabase, MongoDB Atlas, Prisma + PostgreSQL

| Reason | Detail |
|---|---|
| **Real-time by default** | Every `useQuery()` call creates a live subscription. When the AI writes data, the UI updates instantly without polling or manual cache invalidation. This is critical for our chat streaming UX. |
| **Serverless functions** | Mutations and queries are defined as plain JS functions (`convex/workspace.js`), deployed automatically — no Docker, no server provisioning. |
| **Schema validation** | `defineTable()` + `v.string()` validators give us type-safe, schema-enforced data at the database level without needing a separate ORM. |
| **Indexes** | First-class index support (e.g., `by_user`, `by_email`) makes queries fast and explicit. |
| **Zero infrastructure** | No database server to manage, no connection pooling, no cold starts. Convex handles all of it. |

**Why not Firebase?** Firebase Firestore doesn't enforce schemas and has a steeper learning curve for real-time rules. Convex's developer experience is significantly more ergonomic — functions are plain JS, not a proprietary rules language.

**Why not Supabase/PostgreSQL?** Supabase is excellent, but it requires writing SQL or using its client SDK with manual real-time channel subscriptions. Convex's `useQuery` reactivity is automatic and requires zero boilerplate.

---

## Why Sandpack (In-Browser Code Execution)?

**Alternatives considered:** Monaco Editor + manual iframe, StackBlitz WebContainers, CodeMirror

| Reason | Detail |
|---|---|
| **Full React runtime in the browser** | Sandpack bundles, transpiles, and runs React code entirely client-side. No server needed to compile the generated code. |
| **Built-in file explorer + editor + preview** | `SandpackFileExplorer`, `SandpackCodeEditor`, and `SandpackPreview` give us a complete IDE experience with minimal code. |
| **Dependency injection** | The `customSetup.dependencies` prop lets us inject npm packages (Tailwind, lucide-react, chart.js, etc.) that the AI can use in generated code. |
| **Battle-tested** | Sandpack is built by CodeSandbox and powers millions of interactive code examples across the web (React docs, MDN, etc.). |

**Why not Monaco + iframe?** Monaco is just an editor — it doesn't compile or run code. We would need to build a full bundler pipeline (Webpack/esbuild) ourselves, which is hundreds of hours of work.

**Why not StackBlitz WebContainers?** WebContainers run a full Node.js environment in the browser, which is more powerful but significantly heavier. Sandpack is lighter, faster to load, and purpose-built for React previews.

---

## Why Google Gemini 2.0 Flash?

**Alternatives considered:** OpenAI GPT-4o, Anthropic Claude, open-source models (Llama, Mistral)

| Reason | Detail |
|---|---|
| **Speed** | Gemini 2.0 Flash is one of the fastest large language models available — critical for an interactive code generation UX where users expect near-instant responses. |
| **JSON mode** | The `responseMimeType: "application/json"` config guarantees the model returns valid JSON, which is essential for our Sandpack file-tree parsing. Not all models support this reliably. |
| **Streaming** | `generateContentStream()` lets us stream chat responses token-by-token, creating a "typing" effect that makes the AI feel alive and responsive. |
| **Generous free tier** | Gemini offers a substantial free quota, making this project viable without upfront costs — important for a student/portfolio project. |
| **Centralized config** | The model name is stored in `Lookup.GEMINI_MODEL`, so switching to a different Gemini variant (e.g., `gemini-2.0-pro`) is a one-line change. |

**Why not OpenAI?** OpenAI's API requires a credit card even for free-tier access and has stricter rate limits. Gemini's free tier is more accessible.

---

## Why React Context (Not Redux/Zustand)?

**Alternatives considered:** Redux Toolkit, Zustand, Jotai

| Reason | Detail |
|---|---|
| **Simplicity** | Our global state is small — just `user`, `messages`, and `files`. React Context handles this perfectly without the boilerplate of Redux reducers, actions, and slices. |
| **Zero dependencies** | Context is built into React. No extra bundle size. |
| **Sufficient for our scale** | Performance issues with Context arise when re-renders propagate to hundreds of consumers. Our app has ~5 consuming components, so this is not a concern. |

**When would we switch?** If the app grew to have 20+ pieces of shared state or needed features like time-travel debugging, Redux Toolkit or Zustand would be justified. For our current scope, Context is the right choice.

---

## Why Custom Hooks Pattern?

Our business logic is extracted into `hooks/useWorkspace.js` and `hooks/useCodeGeneration.js`.

| Reason | Detail |
|---|---|
| **Separation of concerns** | Components handle rendering. Hooks handle logic. This makes both easier to understand and maintain. |
| **Testability** | Hooks can be tested in isolation by mocking their dependencies, without needing to render full component trees. |
| **Reusability** | If we add a mobile view or a different layout for the workspace, the same `useWorkspace` hook powers it. |
| **Industry standard** | Custom hooks are the recommended pattern by the React team and expected by hiring managers reviewing portfolio projects. |

---

## Why Tailwind CSS?

**Alternatives considered:** Styled Components, CSS Modules, plain CSS, Material UI

| Reason | Detail |
|---|---|
| **Speed of development** | Utility classes let us style directly in JSX without context-switching to separate CSS files. |
| **Consistency** | Tailwind's design tokens (spacing, colors, typography) enforce a consistent visual language. |
| **Dark mode** | `dark:` variant classes + `next-themes` give us dark mode with minimal effort. |
| **Sandpack compatibility** | The generated code inside Sandpack also uses Tailwind (via CDN), so the AI's output is styled consistently. |
| **Industry adoption** | Tailwind is used by Vercel, Shopify, GitHub, and is the most popular CSS framework — a valuable skill to demonstrate. |

---

## Why Stripe for Billing?

**Alternatives considered:** Paddle, LemonSqueezy, custom payment implementation

| Reason | Detail |
|---|---|
| **Industry standard** | Stripe is the most widely used payment processor. Knowing the Stripe integration pattern is a transferable skill. |
| **Subscription support** | Built-in support for recurring billing, customer portal, and webhook-driven lifecycle events. |
| **Webhook architecture** | Our `app/api/stripe/webhook/route.js` demonstrates a real-world event-driven architecture — a strong talking point in interviews. |
| **Test mode** | Full functionality in test mode without real money, perfect for a portfolio project. |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         BROWSER                                │
│                                                                │
│  ┌──────────┐   ┌─────────────────┐   ┌────────────────────┐  │
│  │  Landing  │──▶│   Workspace     │   │     Dashboard      │  │
│  │  Page     │   │  ┌──────┬─────┐ │   │  (user projects)   │  │
│  └──────────┘   │  │Sidebar│Code │ │   └────────────────────┘  │
│                 │  │ Chat  │View │ │                            │
│                 │  └──┬───┘└──┬──┘ │                            │
│                 └─────┼───────┼────┘                            │
│                       │       │                                 │
│              useWorkspace  useCodeGeneration                    │
│                  (hook)       (hook)                            │
│                       │       │                                 │
│              ┌────────▼───────▼────────┐                       │
│              │    PromptContext         │                       │
│              │  (messages, files)       │                       │
│              └─────────────────────────┘                       │
└────────────────────┬────────────────┬──────────────────────────┘
                     │                │
            ┌────────▼──┐     ┌───────▼────────┐
            │  Convex    │     │  Google Gemini  │
            │ (Database) │     │  (AI Engine)    │
            └────────────┘     └────────────────┘
```

---

## Summary: Why This Stack Works

> **"We chose tools that maximize developer velocity while demonstrating real-world patterns: Next.js for full-stack routing, Convex for zero-config real-time data, Sandpack for client-side code execution, and Gemini for fast AI generation with native JSON mode. Every dependency earns its place — there is no bloat."**

This is a strong one-liner to use in interviews when asked about your architecture.
