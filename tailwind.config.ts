import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef4ff",
          100: "#d9e7ff",
          700: "#173764",
          800: "#102a4f",
          900: "#0b1f3a"
        },
        gold: {
          100: "#fff4cc",
          300: "#f4d35e",
          500: "#d6a819"
        }
      },
      boxShadow: {
        soft: "0 16px 45px rgba(15, 31, 58, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
