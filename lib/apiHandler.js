import { NextResponse } from "next/server";

/**
 * withErrorHandler — API route error handler wrapper.
 *
 * Wraps an async route handler with consistent try/catch logic:
 *   1. Calls the handler
 *   2. On error, logs to console and returns a structured JSON error response
 *
 * This eliminates the repeated try/catch → NextResponse.json(error, 500)
 * pattern across all API routes.
 *
 * Usage:
 *   export const POST = withErrorHandler(async (req) => {
 *     // ... your logic
 *     return NextResponse.json({ data });
 *   });
 *
 * @param {function} handler  The route handler (receives req, returns NextResponse)
 * @param {string}   label    Optional label for log messages (e.g., "Stripe checkout")
 * @returns {function}        Wrapped handler
 */
export function withErrorHandler(handler, label = "API") {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error(`${label} error:`, error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  };
}
