import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "page-bg": "#f4f4f0",
        "brand-black": "#111",
        "brand-muted": "#555",
        "brand-light": "#888",
        border: "rgba(0,0,0,0.08)",
        "blue-pastel": "#ddeeff",
        "peach-pastel": "#ffe8d6",
        "mint-pastel": "#d6ffe8",
        "lavender-pastel": "#ead6ff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        carousel: "24px",
        pill: "100px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.10)",
        btn: "0 2px 16px rgba(0,0,0,0.10)",
        "btn-hover": "0 4px 24px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
