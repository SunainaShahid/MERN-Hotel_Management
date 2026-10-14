/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#D4AF37',
          500: '#AA7C11',
          600: '#8B6508',
        },
        luxury: {
          dark: '#0F172A',
          card: '#1E293B',
          bg: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}