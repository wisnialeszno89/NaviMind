/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', backgroundColor: 'rgb(37 99 235)' }, 
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgb(59 130 246)' }, 
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
    },
    screens: {
      sm: "850px",
      md: "1024px",
      lg: "1280px",
      xl: "1536px",
    },
  },
  plugins: [],
};