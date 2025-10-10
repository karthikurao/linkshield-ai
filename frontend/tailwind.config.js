// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Ensure these are exactly as you intend
        'brand-accent': '#14b8a6',           // Teal-500 (for general use, default/light mode)
        'brand-accent-hover': '#0d9488',     // Teal-600
        'brand-accent-dark': '#2dd4bf',        // Teal-400 (for use in dark mode for text/rings)
        'brand-accent-dark-hover': '#5eead4',  // Teal-300
      },
    },
  },
  plugins: [],
}