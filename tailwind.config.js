/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        construction: {
          yellow: "#FDB913",
          darkGray: "#2C2C2C",
          mediumGray: "#4A4A4A",
          lightGray: "#E5E5E5",
          orange: "#FF6B35",
        },
      },
      fontFamily: {
        display: ["Bebas Neue", "Impact", "sans-serif"],
        body: ["Roboto Condensed", "Arial Narrow", "sans-serif"],
      },
    },
  },
  plugins: [],
};
