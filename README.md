# CodePilot

CodePilot is an advanced, AI-powered web development platform designed to streamline the process of building, running, and deploying full-stack web applications. Built with a focus on developer experience and security, it leverages the latest web technologies to provide a seamless "prompt-to-code" workflow.

## Key Features

### Bring Your Own Key (BYOK) Architecture
CodePilot implements a secure BYOK pattern. Users provide their own Gemini API keys, which are stored exclusively within the browser's local storage. This ensures that sensitive credentials never reach the server, providing maximum security and allowing for decentralized AI usage costs.

### Real-time Interactive Preview
The platform integrates a live in-browser preview environment using CodeSandbox Sandpack. As the AI generates code, the preview updates in real-time, allowing users to see their application come to life instantly.

### Intelligent Code Generation
Leveraging the Google Gemini model, CodePilot can generate complex React components, utility functions, and complete project structures based on simple natural language prompts.

### Flexible Workspace Layouts
The workspace features multiple viewing modes, including high-density split views and immersive floating layouts, tailored for both focused coding and rapid prototyping.

### Enterprise-Grade Security and Authentication
Integrated with Google OAuth for secure user authentication and Convex for a robust, real-time database backend that persists user workspaces and project history.

## Technology Stack

### Core Framework
- Next.js 15 (App Router)
- React 19
- Tailwind CSS

### Backend and Database
- Convex (Real-time Backend-as-a-Service)

### AI and Code Rendering
- Google Gemini AI
- Sandpack (Interactive Code Environment)

### Integrations
- Stripe (Subscription and Billing)
- Google OAuth (Authentication)
- Lucide React (Iconography)

## Getting Started

### Prerequisites
- Node.js 18.x or later
- A Convex account
- A Google Cloud project for OAuth
- A Stripe account for billing features

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NoelPOS/codepilot.git
   cd codepilot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOYMENT=your_deployment_name
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The project is optimized for deployment on the Vercel platform. Ensure all environment variables are correctly configured in the Vercel dashboard and that the Convex production deployment is linked.

## License

This project is licensed under the MIT License.

