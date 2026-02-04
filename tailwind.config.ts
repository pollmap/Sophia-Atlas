import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Era colors
        ancient: {
          DEFAULT: "#D4AF37",
          light: "#F0D060",
          dark: "#A08520",
        },
        medieval: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
        },
        modern: {
          DEFAULT: "#14B8A6",
          light: "#5EEAD4",
          dark: "#0D9488",
        },
        contemporary: {
          DEFAULT: "#64748B",
          light: "#94A3B8",
          dark: "#475569",
        },
        // App colors
        background: {
          DEFAULT: "#0F172A",
          secondary: "#1E293B",
          tertiary: "#334155",
        },
        foreground: {
          DEFAULT: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
        accent: {
          DEFAULT: "#D4AF37",
          hover: "#F0D060",
        },
        border: {
          DEFAULT: "#334155",
          light: "#475569",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "system-ui", "sans-serif"],
        display: ["Gmarket Sans", "Pretendard", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
