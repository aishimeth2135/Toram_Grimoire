module.exports = {
  plugins: {
    'postcss-discard-comments': {},
    'tailwindcss/nesting': {},
    'tailwindcss': require('./tailwind.config.js'),
    'autoprefixer': {},
  },
}
