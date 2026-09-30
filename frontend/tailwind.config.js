/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#3B2E2A",
        ink2: "#2A211D",
        coral: "#E86C3A",
        coral2: "#D45A2C",
        cream: "#FBF3EC",
        line: "#EADFD3",
      },
      fontFamily: {
        sans: ["'Public Sans'", "system-ui", "sans-serif"],
        display: ["'Fraunces'", "serif"],
      },
    },
  },
  plugins: [],
}
