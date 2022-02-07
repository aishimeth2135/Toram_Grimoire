module.exports = {
  plugins: {
    'postcss-discard-comments': {},
    'tailwindcss/nesting': {},
    'postcss-simple-vars': {},
    tailwindcss: require('./tailwind.config'),
    autoprefixer: {},
  },
}
