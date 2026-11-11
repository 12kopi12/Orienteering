/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orienteering: {
          orange: '#EE6422', // Official IOF orange
          blue: '#004B87',   // Official IOF blue
          green: '#2D8A4E',
        }
      }
    },
  },
  plugins: [],
}
