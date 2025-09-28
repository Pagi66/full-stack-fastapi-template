import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { router } from "@/router";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
// import { ExecutionFeedProvider } from "@/providers/execution-feed-provider";
import { AuthErrorBoundary } from "@/components/auth/error-boundary";
import "@/api/client-config";
import "@/styles/globals.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthErrorBoundary>
                <AuthProvider>
                    {/* <ExecutionFeedProvider> */}
                        <ThemeProvider>
                            <RouterProvider router={router} />
                            <ReactQueryDevtools initialIsOpen={false} />
                        </ThemeProvider>
                    {/* </ExecutionFeedProvider> */}
                </AuthProvider>
            </AuthErrorBoundary>
        </QueryClientProvider>
    </StrictMode>,
);
