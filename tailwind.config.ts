import type { Config } from "tailwindcss";

export default {
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
        brown: {
          100: '#E6DCDC',
          200: '#D4C3C3',
          500: '#8B7355',
          600: '#6B5842',
        },
        blackflag: "#3B4450",
        lightGrey: "#BDC2C8",
        red: {
          700: '#B91C1C',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
