# Codepilot Configuration & Setup Guide

This guide walks you through configuring every external service required to run Codepilot locally.

---

## 1. Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# ── Convex ─────────────────────────────────────────────
CONVEX_DEPLOYMENT=dev:your-deployment-slug
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-slug.convex.cloud

# ── Google OAuth ───────────────────────────────────────
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# ── Google Gemini AI ───────────────────────────────────
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# ── Stripe (required for billing features) ─────────────
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PRO_PRICE_ID=price_your-stripe-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# ── App URL (used for Stripe redirects) ─────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Convex Setup

Convex is the real-time backend database powering workspaces and user data.

### Initial Setup
1. Install the Convex CLI globally:
   ```bash
   npm install -g convex

   ```
2. Log in to Convex:
   ```bash
   npx convex login
   ```
3. Initialize Convex for this project (first time only):
   ```bash
   npx convex init
   ```
   This creates a new project, generates a deployment URL, and writes it to `.env.local`.

### Running the Dev Backend
Every time you develop locally, start the Convex dev server alongside Next.js:
```bash
npx convex dev
```
This watches `convex/` for schema changes and syncs them automatically.

### Schema
The database schema is defined in `convex/schema.js` and contains:
- **`users`** — stores name, email, picture, uid, plan, usage, and Stripe IDs. Indexed by `email`.
- **`workspaces`** — stores messages, files, title, and links to the owner user. Indexed by `user`.

### Dashboard
View and manage your data at [dashboard.convex.dev](https://dashboard.convex.dev).

---

## 3. Google OAuth Setup

Google OAuth handles user sign-in.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services → Credentials**.
4. Click **Create Credentials → OAuth client ID**.
5. Set the application type to **Web application**.
6. Add Authorized JavaScript Origins:
   - `http://localhost:3000` (development)
   - Your production URL (when deployed)
7. Add Authorized Redirect URIs:
   - `http://localhost:3000` (development)
8. Copy the **Client ID** and paste it as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your `.env.local`.

> **Note**: The `next.config.mjs` file already includes `lh3.googleusercontent.com` in the allowed image domains so that Google profile pictures render via `next/image`.

---

## 4. Google Gemini AI Setup

Gemini powers both the conversational chat and code generation.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Click **Create API Key**.
3. Copy the key and paste it as `NEXT_PUBLIC_GEMINI_API_KEY` in your `.env.local`.

> **Model**: The app uses `gemini-2.0-flash` by default. This is configured in `data/Lookup.jsx` under `GEMINI_MODEL` and can be changed to any supported Gemini model.

---

## 5. Stripe Setup (Billing / Subscriptions)

Stripe handles the Pro plan upgrade and billing portal.

### 5a. Create a Stripe Account
1. Sign up at [stripe.com](https://stripe.com).
2. Switch to **Test Mode** (toggle in the top-right).

### 5b. Get Your Secret Key
1. Go to **Developers → API Keys**.
2. Copy the **Secret key** (`sk_test_...`) and paste it as `STRIPE_SECRET_KEY`.

### 5c. Create a Price (Product)
1. Go to **Products → Add Product**.
2. Name: `CodePilot Pro`, Price: `$12/month`, Billing period: `Monthly`.
3. After creating, click into the price and copy the **Price ID** (`price_...`).
4. Paste it as `STRIPE_PRO_PRICE_ID`.

### 5d. Set Up the Webhook
The webhook listens for Stripe events to upgrade/downgrade users automatically.

1. Go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL:
   - **Local dev**: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     This prints a webhook signing secret (`whsec_...`).
   - **Production**: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** and paste it as `STRIPE_WEBHOOK_SECRET`.

### API Routes
The app has three Stripe-related API routes:
| Route | Purpose |
|---|---|
| `app/api/stripe/checkout/route.js` | Creates a Stripe Checkout session for Pro upgrade |
| `app/api/stripe/portal/route.js` | Opens the Stripe Billing Portal for plan management |
| `app/api/stripe/webhook/route.js` | Receives Stripe events and updates user plan in Convex |

---

## 6. Running the App

After all configuration is in place:

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Quick Checklist

| Service | Env Variable | Where to Get It |
|---|---|---|
| Convex | `CONVEX_DEPLOYMENT` | `npx convex init` auto-generates |
| Convex | `NEXT_PUBLIC_CONVEX_URL` | `npx convex init` auto-generates |
| Google OAuth | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| Gemini AI | `NEXT_PUBLIC_GEMINI_API_KEY` | Google AI Studio → API Keys |
| Stripe | `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| Stripe | `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Products → Price ID |
| Stripe | `STRIPE_WEBHOOK_SECRET` | Stripe CLI or Dashboard → Webhooks |
| App URL | `NEXT_PUBLIC_APP_URL` | Set to `http://localhost:3000` for dev |
