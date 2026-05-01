/**
 * Tailwind configuration: disable dark mode and target source files.
 */
module.exports = {
  darkMode: false,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,css,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,css,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
