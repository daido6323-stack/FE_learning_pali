/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#58cc02',
          light: '#d7f7c2',
          dark: '#46a302',
        },
        blue: {
          DEFAULT: '#1cb0f6',
          light: '#ddf4ff',
          dark: '#1899d6',
        },
        purple: {
          DEFAULT: '#ce82ff',
          light: '#f5e3ff',
          dark: '#aa60eb',
        },
        yellow: {
          DEFAULT: '#ffc800',
          light: '#fff5cc',
          dark: '#e6b400',
        },
        orange: {
          DEFAULT: '#ff9600',
          dark: '#e68500',
        },
        red: {
          DEFAULT: '#ff4b4b',
          dark: '#ea2b2b',
        },
        gray: {
          light: '#e5e5e5',
          border: '#e5e5e5',
        }
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
