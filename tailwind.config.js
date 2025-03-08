/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D9596', // New darker blue-green color
        accent: '#F4AF33', // Golden Yellow
        background: '#F7F5F2', // Soft Cream
        text: '#333333', // Dark Grey
        secondary: '#A16207', // Bronze
      },
      fontFamily: {
        title: ['Amiri', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};