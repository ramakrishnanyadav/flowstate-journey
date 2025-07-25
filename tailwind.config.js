// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // NEW: Define our custom color palette
      colors: {
        'cosmic-purple': '#8e44ad',
        'nebula-pink': '#c0392b',
        'deep-space': '#2980b9',
        'star-blue': '#3498db',
      },
      // NEW: Define more complex keyframes
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 1s ease-out forwards',
        // NEW: Define a new animation using our aurora keyframes
        aurora: 'aurora 15s ease infinite',
      },
    },
  },
  plugins: [],
}