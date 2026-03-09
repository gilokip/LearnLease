import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@":            path.resolve(__dirname, "./src"),
      "@components":  path.resolve(__dirname, "./src/components"),
      "@features":    path.resolve(__dirname, "./src/features"),
      "@pages":       path.resolve(__dirname, "./src/pages"),
      "@hooks":       path.resolve(__dirname, "./src/hooks"),
      "@services":    path.resolve(__dirname, "./src/services"),
      "@store":       path.resolve(__dirname, "./src/store"),
      "@types":       path.resolve(__dirname, "./src/types"),
      "@utils":       path.resolve(__dirname, "./src/utils"),
      "@lib":         path.resolve(__dirname, "./src/lib"),
      "@router":      path.resolve(__dirname, "./src/router"),
      "@assets":      path.resolve(__dirname, "./src/assets"),
      "@styles":      path.resolve(__dirname, "./src/styles"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target:       "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir:     "dist",
    sourcemap:  true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ["react", "react-dom", "react-router-dom"],
          query:    ["@tanstack/react-query"],
          charts:   ["recharts"],
          forms:    ["react-hook-form", "zod"],
        },
      },
    },
  },
});
