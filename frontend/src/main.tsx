import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           1000 * 60 * 5,
      gcTime:              1000 * 60 * 10,
      retry:               1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background:   "var(--bg-card)",
              color:         "var(--text-primary)",
              border:        "1px solid var(--border)",
              borderRadius:  "10px",
              fontSize:      "14px",
              boxShadow:     "var(--shadow-dropdown)",
            },
            success: { iconTheme: { primary: "#3b5bfc", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#d34053", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
