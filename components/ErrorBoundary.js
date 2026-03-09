"use client";

import React from "react";

/**
 * ErrorBoundary — catches uncaught React errors and displays a recovery UI.
 *
 * Class component because React error boundaries require getDerivedStateFromError
 * and componentDidCatch lifecycle methods (not available in hooks).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development; in production, replace with
    // Sentry, LogRocket, or your preferred error tracking service.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback was provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-gray-500 max-w-md">
            An unexpected error occurred. Please try again or reload the page.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 text-left text-xs text-gray-400 max-w-lg">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 p-3 rounded bg-gray-100 dark:bg-gray-900 overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
