/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        OpenSans: ["Open Sans", "sans serif"]
      },
      backgroundColor: {
        darkBG: "#0e1013",
        darkSecBG: "#1b1d20",
        darkComp: "#8fbc8f"
      }
    },
  },
  plugins: [],
}