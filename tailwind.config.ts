import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Graphik', ...fontFamily.sans],
        harlow: ['Harlow Solid Italic', 'cursive'],
        serif: ['Merriweather', 'serif'],
        pacifico: ['var(--font-pacifico)', ...fontFamily.sans],
        display: ['Bungee', ...fontFamily.sans], // Added 'Bungee' font here
      },
    },
  },
  plugins: [],
};

export default config;
