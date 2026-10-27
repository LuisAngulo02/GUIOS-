/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        guios: {
          primary: "#3F6F58",
          dark: "#2F5444",
          light: "#F3F7F4",
          border: "#DDE7E1",
          pillGreenBg: "#DDEFE3",
          pillGreenText: "#25633C",
          pillRedBg: "#FBE0E0",
          pillRedText: "#B33A3A",
          pillAmberBg: "#FEF3C7",
          pillAmberText: "#92400E",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      }
    },
  },
  plugins: [],
}
