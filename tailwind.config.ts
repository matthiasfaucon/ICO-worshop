import type { Config } from "tailwindcss";
const { fontFamily } = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        magellan: ['Magellan', ...fontFamily.sans],
        filson: ['FilsonProRegular', ...fontFamily.sans],
      },
      backgroundImage: {
        'brown-texture': "url('/cards/background-app-brown.svg')",
        'red-texture': "url('/cards/background-app-red.png')",
        'blue-texture': "url('/cards/background-app-blue.png')",
        'blue-violet-texture': "url('/cards/background-app-blue-violet.png')",
        'dos-carte': "url('/cards/dos-de-carte.png')",
        'custom-gradient': "linear-gradient(167deg, rgba(121,83,13,1) 0%, rgba(166,95,17,1) 35%, rgba(240,157,52,1) 100%)",
        'pirate': "url('/cards/pirate.png')",
        'marin': "url('/cards/marin.png')",
        'home': "url('/cards/fond-home.png')",
      },
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
