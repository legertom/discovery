import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1F4E79",
          50: "#EBF3FA",
          100: "#D6E6F4",
          600: "#2E75B6",
          900: "#173A5A",
        },
        ink: "#1f2937",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)",
        cardhover: "0 4px 12px rgba(16,24,40,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
