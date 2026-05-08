/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1313ec",
        "primary-dark": "#0b0bc8",
        "accent-cyan": "#00f0ff",
        "accent-purple": "#b941ff",
        "accent-green": "#0bda68",
        "background-light": "#f6f6f8",
        "background-dark": "#111118",
        "surface-dark": "#1a1a24",
        "surface-highlight": "#282839",
        "card-dark": "#1c1c2e",
        "border-dark": "#282839",
        "text-secondary": "#9d9db9",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}

