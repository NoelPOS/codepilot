import dedent from "dedent";
import {
  FileCode2,
  CheckSquare,
  LayoutDashboard,
  Rocket,
  Palette,
  BrainCircuit,
  Wallet,
  CloudSun
} from "lucide-react";

export default {
  SUGGSTIONS: [
    "Create ToDo App in React",
    "Create Budget Track App",
    "Create Gym Managment Portal Dashboard",
    "Create Quizz App On History",
    "Create Login Signup Screen",
  ],

  STARTER_TEMPLATES: [
    {
      id: "blank",
      label: "Blank",
      icon: FileCode2,
      desc: "Start from scratch with an empty React app.",
      prompt: "Create a minimal Hello World React app with a centered heading and a subtitle. Use Tailwind CSS.",
    },
    {
      id: "todo",
      label: "Todo App",
      icon: CheckSquare,
      desc: "Task manager with add, complete, and delete.",
      prompt:
        "Build a beautiful Todo app with: a text input to add tasks, a list showing all tasks with checkboxes to mark complete (strike-through when done), a delete button per task, filter tabs (All / Active / Completed), and a live task count. Use Tailwind CSS with a clean card-based design and smooth animations.",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      desc: "Admin panel with charts and stat cards.",
      prompt:
        "Build an admin dashboard with: a sidebar nav with icons (Dashboard, Analytics, Users, Settings), a top header with a search bar and avatar, a row of 4 KPI stat cards (Total Users, Revenue, Active Sessions, Conversion Rate) with trend arrows, and a placeholder bar chart section. Use Tailwind CSS with a dark sidebar and white content area.",
    },
    {
      id: "landing",
      label: "Landing Page",
      icon: Rocket,
      desc: "Product landing page with hero and features.",
      prompt:
        "Build a modern SaaS landing page with: a sticky navbar with logo and CTA button, a hero section with headline, subtitle, and two CTA buttons, a features section showing 3 feature cards with icons, a testimonials section with 2 quote cards, and a footer. Use Tailwind CSS with a gradient hero background and clean professional design.",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Palette,
      desc: "Developer portfolio with projects and skills.",
      prompt:
        "Build a developer portfolio with: a hero section with name, role, and a typed-effect subtitle, an About section, a Skills section showing tech badges (React, Node, Python, etc.), a Projects section with 3 project cards each having a title, description, and GitHub/Demo links, and a Contact section with a form. Use Tailwind CSS with a dark theme and accent color.",
    },
    {
      id: "quiz",
      label: "Quiz App",
      icon: BrainCircuit,
      desc: "Multiple choice quiz with score tracking.",
      prompt:
        "Build a quiz app with: a start screen with a title and start button, a question screen showing the current question number, the question text, 4 multiple-choice answer buttons (highlight correct/incorrect on click), a progress bar, and a results screen with score shown as percentage and a restart button. Use Tailwind CSS with engaging colors.",
    },
    {
      id: "expense",
      label: "Expense Tracker",
      icon: Wallet,
      desc: "Budget tracker with income and expenses.",
      prompt:
        "Build an expense tracker with: a balance display at the top, separate totals for Income and Expenses, a form to add new transactions (description, amount, type), and a transaction list with delete buttons. Use color coding (green for income, red for expense). Use Tailwind CSS with a clean card layout.",
    },
    {
      id: "weather",
      label: "Weather App",
      icon: CloudSun,
      desc: "Weather UI with mock data and location cards.",
      prompt:
        "Build a weather app UI (using mock/static data — no API calls) with: a search bar at the top, a main weather card showing city, temperature, condition icon (use emoji), humidity and wind speed, and a 5-day forecast row with daily cards. Use Tailwind CSS with a gradient sky background that changes between day and night themes based on a toggle.",
    },
  ],
  HERO_HEADING: "What do you want to build?",
  HERO_DESC: "Prompt, run, edit, and deploy full-stack web apps.",
  INPUT_PLACEHOLDER: "What you want to build?",
  SIGNIN_HEADING: "Continue With Bolt.New 2.0",
  SIGNIN_SUBHEADING:
    "To use Bolt you must log into an existing account or create one.",
  SIGNIn_AGREEMENT_TEXT:
    "By using Bolt, you agree to the collection of usage data for analytics.",

  DEFAULT_FILE: {
    "/App.js": {
      code: `import './App.css';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to CodePilot</h1>
        <p className="mt-2 text-gray-500">Type a prompt to start building your app.</p>
      </div>
    </div>
  );
}`,
    },
    "/App.css": {
      code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "/public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodePilot App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
  },
  DEPENDANCY: {
    uuid4: "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    firebase: "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
  },
  PRICING_DESC:
    "Start with a free account to speed up your workflow on public projects or boost your entire team with instantly-opening production environments.",
  PRICING_OPTIONS: [
    {
      name: "Basic",
      tokens: "50K",
      value: 50000,
      desc: "Ideal for hobbyists and casual users for light, exploratory use.",
      price: 4.99,
    },
    {
      name: "Starter",
      tokens: "120K",
      value: 120000,
      desc: "Designed for professionals who need to use Bolt a few times per week.",
      price: 9.99,
    },
    {
      name: "Pro",
      tokens: "2.5M",
      value: 2500000,
      desc: "Designed for professionals who need to use Bolt a few times per week.",
      price: 19.99,
    },
    {
      name: "Unlimted (License)",
      tokens: "Unmited",
      value: 999999999,
      desc: "Designed for professionals who need to use Bolt a few times per week.",
      price: 49.99,
    },
  ],

  GOOGLE_USERINFO_URL: "https://www.googleapis.com/oauth2/v3/userinfo",
  GEMINI_MODEL: "gemini-2.5-flash",

  PLANS: {
    free: {
      label: "Free",
      promptLimit: 10,
      workspaceLimit: 3,
      price: 0,
      features: [
        "10 AI prompts / month",
        "3 saved workspaces",
        "Live in-browser preview",
        "ZIP download",
      ],
    },
    pro: {
      label: "Pro",
      promptLimit: 500,
      workspaceLimit: Infinity,
      price: 12,
      features: [
        "500 AI prompts / month",
        "Unlimited workspaces",
        "Live in-browser preview",
        "ZIP download",
        "Priority AI responses",
        "Early access to new features",
      ],
    },
  },

  AIPrompt:
    "You are an AI assistant experienced in React development. Guidelines: - Tell the user what you are building. - Respond in less than 15 lines. - Skip code examples and commentary.",
  AIPrompt2: dedent`You are an expert React developer. Generate or update a React project to fulfill the user request.

CRITICAL — SANDPACK FILE STRUCTURE RULES (violating these will break the preview):
- This project runs as a Create React App (CRA) inside a browser sandbox.
- The ONLY valid file locations are:
    /App.js              ← your main React component (REQUIRED)
    /App.css             ← styles, imported in App.js with: import './App.css'
    /components/Name.js  ← sub-components (NOT /src/components/)
    /utils/helpers.js    ← utilities if needed
- NEVER create or include these files — they already exist and must not be overwritten:
    /index.js            ← already exists, imports from /App.js
    /public/index.html   ← already exists, includes Tailwind CDN
- NEVER use a /src/ folder or any path starting with /src/
- NEVER create vite.config.js, webpack.config.js, or package.json
- If creating sub-components, import them in /App.js like: import Button from './components/Button'

Content rules:
- If CURRENT PROJECT FILES are provided, make targeted edits. Preserve all functionality not mentioned.
- Always include ALL files in the response EXCEPT /index.js and /public/index.html.
- Use lucide-react for icons. Use Tailwind CSS for all styling — no inline styles.
- Use emoji where it improves UX.
- For placeholder images use: https://archive.org/download/

Return ONLY a valid JSON object with this exact schema:
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": { "code": "" },
    "/App.css": { "code": "" }
  },
  "generatedFiles": ["/App.js", "/App.css"]
}

The "files" object must contain every file in the project except /index.js and /public/index.html.
"generatedFiles" lists all the file paths in the files object.
`,
};
