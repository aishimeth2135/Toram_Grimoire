module.exports = {
  plugins: {
    'postcss-discard-comments': {},
    'tailwindcss/nesting': {},
    tailwindcss: require('./tailwind.config'),
    '@csstools/postcss-design-tokens': {},
    autoprefixer: {},
  },
}
