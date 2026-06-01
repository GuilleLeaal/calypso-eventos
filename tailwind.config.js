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

        rustic: {
          ivory: "#F6F0E7",
          sand: "#E9D8C2",
          stone: "#D7C0A7",
          clay: "#C78D63",
          terracotta: "#A8643A",
          walnut: "#5A4032",
          espresso: "#2E211B",
        },

        accent: {
          gold: "#C9A46A",
          copper: "#B97850",
        },
      },

      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        warm: "0 10px 30px rgba(46, 33, 27, 0.12)",
        soft: "0 8px 24px rgba(46, 33, 27, 0.08)",
      },

      backgroundImage: {
        "hero-warm-overlay":
          "linear-gradient(to bottom, rgba(20,14,12,0.30), rgba(20,14,12,0.72))",
        "warm-radial":
          "radial-gradient(circle at top left, rgba(201,164,106,0.18), transparent 40%)",
      },
    },
  },
  plugins: [],
};