module.exports = {
  parser: require('postcss-comment'),
  plugins: {
    tailwindcss: require('./tailwind.config'),
    autoprefixer: {},
    'postcss-nesting': {},
    'postcss-variables': {}
  }
}
