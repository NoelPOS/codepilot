import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";
import { Header } from "@/components/Navbar/Header";
import { GlobalProvider } from "@/providers/GlobalProvidor";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "CodePilot - Build Your Vision",
  description: "AI-powered web development platform. Prompt, run, and deploy full-stack apps instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GlobalProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster richColors position="top-right" />
            <Header />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
