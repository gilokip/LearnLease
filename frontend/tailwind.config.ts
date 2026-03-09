import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b5bfc",
          50:  "#eef1ff",
          100: "#dce3ff",
          200: "#b9c7ff",
          300: "#96abff",
          400: "#7390ff",
          500: "#3b5bfc",
          600: "#2f4ce8",
          700: "#2340c4",
          800: "#1a31a0",
          900: "#122280",
        },
        boxdark:      "#24303f",
        "boxdark-2":  "#1a222c",
        bodydark:     "#aeb7c0",
        bodydark2:    "#8a99af",
        success:  "#219653",
        danger:   "#d34053",
        warning:  "#ffa70b",
        info:     "#3ba2b8",
        navy: {
          900: "#0a0f1e",
          800: "#0d1120",
          700: "#10162a",
          600: "#161d35",
          500: "#1e2845",
          400: "#283460",
          300: "#354278",
        },
        accent: {
          blue:   "#3b5bfc",
          violet: "#a78bfa",
          sky:    "#38bdf8",
          green:  "#22c55e",
          amber:  "#f59e0b",
          red:    "#ef4444",
        },
      },
      fontFamily: {
        sans:    ["DM Sans", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "card":          "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.08)",
        "card-dark":     "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover":    "0 10px 25px rgba(0,0,0,0.12)",
        "glow-primary":  "0 0 20px rgba(59,91,252,0.35)",
        "glow-success":  "0 0 20px rgba(34,197,94,0.25)",
      },
      animation: {
        "fade-in":    "fadeIn 0.25s ease forwards",
        "fade-up":    "fadeUp 0.4s ease forwards",
        "slide-in":   "slideIn 0.35s ease forwards",
        "spin-slow":  "spin 3s linear infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp:  { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        float:   { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
