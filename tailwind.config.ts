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
        // `navy` is repointed to the Clever brand blue/navy so the whole app
        // adopts the brand through the tokens it already uses.
        navy: {
          DEFAULT: "#1464FF", // Clever blue
          50: "#DAEBFF", // light blue tint
          100: "#C2DBFF",
          600: "#1464FF",
          900: "#0A1E46", // deep navy
        },
        // Full Clever palette for brand-forward surfaces (guide, dividers).
        clever: {
          blue: "#1464FF",
          navy: "#0A1E46",
          sky: "#DAEBFF",
          ink: "#1C1C1C",
          orange: "#F78239",
          yellow: "#FFE478",
          green: "#4ECC97",
        },
        ink: "#1C1C1C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Merriweather", "Georgia", "serif"],
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
