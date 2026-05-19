/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "warm-stone": "#f5f2ef",
        "warm-gray": "#777169",
        "charcoal": "#4e4e4e",
      },
      boxShadow: {
        "outline": "rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px",
        "card": "rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.04) 0px 4px 4px",
        "warm": "rgba(78,50,23,0.04) 0px 6px 16px",
        "inset-border": "rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset",
        "inset-dark": "rgba(0,0,0,0.1) 0px 0px 0px 0.5px inset",
        "edge": "rgba(0,0,0,0.08) 0px 0px 0px 0.5px",
        "soft": "rgba(0,0,0,0.04) 0px 4px 4px",
      },
      borderRadius: {
        "pill": "9999px",
        "warm": "30px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Space Grotesk", "sans-serif"],
      },
      letterSpacing: {
        "display": "-0.96px",
        "body": "0.18px",
        "ui": "0.15px",
        "cta": "0.7px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      }
    }
  },
  plugins: [],
}
