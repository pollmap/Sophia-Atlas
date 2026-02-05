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
        // Fresco backgrounds
        fresco: {
          ivory: "#FAF6E9",
          parchment: "#F0E6D3",
          aged: "#E8DCCA",
          shadow: "#D4C4AB",
        },
        // Sepia inks
        ink: {
          dark: "#2C2416",
          medium: "#4A3C2A",
          light: "#7A6B55",
          faded: "#9C8B73",
        },
        // Gold accent
        gold: {
          DEFAULT: "#B8860B",
          hover: "#D4A84B",
          light: "#E8C874",
          dark: "#8B6914",
        },
        // Tradition pigments
        pigment: {
          western: "#3D5A80",
          buddhism: "#5B7355",
          confucianism: "#8B4513",
          daoism: "#CC7722",
          indian: "#C2703E",
          islam: "#5D4E6D",
          science: "#2E6B62",
          art: "#8B3A62",
        },
        // Era colors (warm-shifted for fresco)
        ancient: {
          DEFAULT: "#B8860B",
          light: "#D4A84B",
          dark: "#8B6914",
        },
        medieval: {
          DEFAULT: "#6B4E8A",
          light: "#9B7BBD",
          dark: "#4E3468",
        },
        modern: {
          DEFAULT: "#4A7A6B",
          light: "#6BA394",
          dark: "#345A4D",
        },
        contemporary: {
          DEFAULT: "#6B6358",
          light: "#8A8176",
          dark: "#4A4339",
        },
        // Category colors (warm-shifted)
        cat: {
          philosopher: "#4A5D8A",
          religious: "#B8860B",
          scientist: "#5B7355",
          historical: "#8B4040",
          cultural: "#7A5478",
        },
        // Semantic app colors (mapped to CSS vars for theme switching)
        background: {
          DEFAULT: "var(--fresco-ivory)",
          secondary: "var(--fresco-parchment)",
          tertiary: "var(--fresco-aged)",
        },
        foreground: {
          DEFAULT: "var(--ink-dark)",
          secondary: "var(--ink-medium)",
          muted: "var(--ink-light)",
        },
        accent: {
          DEFAULT: "#B8860B",
          hover: "#D4A84B",
        },
        border: {
          DEFAULT: "#D4C4AB",
          light: "#E8DCCA",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Serif KR", "system-ui", "sans-serif"],
        serif: ["Noto Serif KR", "Georgia", "Times New Roman", "serif"],
        display: ["Cormorant Garamond", "Noto Serif KR", "Georgia", "serif"],
        ui: ["Pretendard", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-slide-in": "fadeSlideIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "glow-gold": "glowGold 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
        glowGold: {
          "0%": { boxShadow: "0 0 5px rgba(184, 134, 11, 0.15)" },
          "100%": { boxShadow: "0 0 20px rgba(184, 134, 11, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 4px rgba(184, 134, 11, 0.3)" },
          "50%": { boxShadow: "0 0 16px rgba(184, 134, 11, 0.5)" },
        },
      },
      boxShadow: {
        "sepia-sm": "0 1px 3px rgba(44, 36, 22, 0.08)",
        "sepia": "0 4px 12px rgba(44, 36, 22, 0.1)",
        "sepia-lg": "0 8px 24px rgba(44, 36, 22, 0.12)",
        "gold": "0 4px 16px rgba(184, 134, 11, 0.2)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
