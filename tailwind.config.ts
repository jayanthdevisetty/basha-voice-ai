import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a83219",
        "primary-container": "#c94a2f",
        "primary-fixed": "#ffdad3",
        "primary-fixed-dim": "#ffb4a4",
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "on-primary-fixed": "#3d0600",
        "on-primary-fixed-variant": "#8a1c05",

        surface: "#faf9f6",
        "surface-bright": "#faf9f6",
        "surface-dim": "#dbdad7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f3f1",
        "surface-container": "#efeeeb",
        "surface-container-high": "#e9e8e5",
        "surface-container-highest": "#e3e2e0",
        "surface-variant": "#e3e2e0",

        "on-surface": "#1a1c1a",
        "on-surface-variant": "#58413c",
        outline: "#8c716b",
        "outline-variant": "#e0bfb8",

        secondary: "#5f5e61",
        "secondary-container": "#e4e1e5",
        "secondary-fixed": "#e4e1e5",
        "secondary-fixed-dim": "#c8c6c9",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#656467",
        "on-secondary-fixed": "#1b1b1e",
        "on-secondary-fixed-variant": "#47464a",

        tertiary: "#5b5b64",
        "tertiary-container": "#74747d",
        "tertiary-fixed": "#e3e1ec",
        "tertiary-fixed-dim": "#c6c5cf",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fffbff",
        "on-tertiary-fixed": "#1a1b22",
        "on-tertiary-fixed-variant": "#46464e",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "inverse-surface": "#2f312f",
        "inverse-on-surface": "#f2f1ee",
        "inverse-primary": "#ffb4a4",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        gutter: "1.5rem",
        margin: "2rem",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "quote-transcript": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "headline-xl": ["44px", { lineHeight: "52px", letterSpacing: "-0.03em", fontWeight: "600" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "quote-transcript": ["19px", { lineHeight: "30px", letterSpacing: "-0.015em", fontWeight: "400" }],
        "label-md": ["13px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "500" }],
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        wave: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "20px" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wave: "wave 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
