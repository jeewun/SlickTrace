/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#102a43',
          600: '#0b1b2b',
          700: '#06101e',
        },
        maritime: {
          blue: '#1b365d',
          accent: '#0077b6',
          alert: '#d90429',
          warning: '#f77f00',
          success: '#38b000',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
