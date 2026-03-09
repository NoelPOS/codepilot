/**
 * Unit tests for components/Home/SignInDiaglog.jsx
 *
 * Strategy: render the dialog with different `open` prop values
 * and verify the correct content shows or hides.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Mock external dependencies ────────────────────────────────────────────────

// Mock Radix Dialog — render as simple divs controlled by the `open` prop
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children, className }) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock Google login hook
jest.mock("@react-oauth/google", () => ({
  useGoogleLogin: () => jest.fn(),
}));

// Mock convex
jest.mock("convex/react", () => ({
  useMutation: () => jest.fn(),
}));

jest.mock("@/convex/_generated/api", () => ({
  api: { user: { createUser: "createUser" } },
}));

// Mock uuid4
jest.mock("uuid4", () => jest.fn(() => "mock-uuid"));

// Mock UserContext
jest.mock("@/context/UserContext", () => ({
  UserContext: React.createContext({ user: null, setUser: jest.fn() }),
}));

// Mock Button
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

// ── Import the component under test ───────────────────────────────────────────

import { SignInDiaglog } from "@/components/Home/SignInDiaglog";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SignInDiaglog", () => {
  it("renders the dialog content when open is true", () => {
    render(<SignInDiaglog open={true} onOpenChange={jest.fn()} />);

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/sign in first so you can start building/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
    expect(
      screen.getByText(/terms of service and privacy/i)
    ).toBeInTheDocument();
  });

  it("does not render the dialog content when open is false", () => {
    render(<SignInDiaglog open={false} onOpenChange={jest.fn()} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });
});
