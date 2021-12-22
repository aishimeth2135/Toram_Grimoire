module.exports = {
  plugins: {
    'postcss-mixins': {},
    'postcss-discard-comments': {},
    'tailwindcss/nesting': require('postcss-nested'),
    'postcss-simple-vars': {},
    tailwindcss: require('./tailwind.config'),
    autoprefixer: {},
  },
};
