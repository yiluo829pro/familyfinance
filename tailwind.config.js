/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'fire-lean': '#10b981',
        'fire-regular': '#6366f1',
        'fire-fat': '#f59e0b',
        'fire-coast': '#3b82f6',
      },
    },
  },
  plugins: [],
}
