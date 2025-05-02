// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "dark-green": "#22543D",
      },
      backgroundImage: {
        'quail-hollow': "url('/images/quail-hollow.jpg')",
      },
    },
  },
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
  