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
      textColor: {
        lightPrimary: "#222831",
        lightSecondary: "#393E46",
        darkPrimary: "#f1f1f1",
        darkSecondary: "#d3d3d3"
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