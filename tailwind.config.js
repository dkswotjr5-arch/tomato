/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tomato: {
          light: "#ff6b6b",
          DEFAULT: "#e74c3c",
          dark: "#c0392b",
        },
        accent: {
          light: "#ffe066",
          DEFAULT: "#ffd54f",
          dark: "#f39c12",
        },
        forest: {
          light: "#4eb872",
          DEFAULT: "#2d5a1e",
          dark: "#1b3c10",
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
