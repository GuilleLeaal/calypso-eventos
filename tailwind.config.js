/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        calypso: {
          DEFAULT: "#0BB3A6",
          50: "#E8FFFC",
          100: "#CFFFF8",
          200: "#9CFFF0",
          300: "#63F8E7",
          400: "#2FEAD6",
          500: "#0BB3A6",
          600: "#068A80",
          700: "#056D66",
          800: "#055651",
          900: "#044744",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
