module.exports = {
  plugins: {
    tailwindcss: {
      theme: {
        colors: {
          light: {
            DEFAULT: 'var(--primary-light)',
            2: 'var(--primary-light-2)',
            3: 'var(--primary-light-3)',
            4: 'var(--primary-light-4)'
          },
          dark: 'var(--primary-dark)',
          white: 'var(--white)',
          black: 'var(--black)',
          red: {
            DEFAULT: 'var(--primary-red)',
            light: 'var(--primary-red-light)'
          },
          purple: 'var(--primary-purple)',
          'water-blue': {
            DEFAULT: 'var(--primary-water-blue)',
            light: 'var(--primary-water-blue-light)'
          },
          orange: 'var(--primary-orange)',
          green: 'var(--primary-green)',
          gray: 'var(--primary-gray)',
        },
        borderWidth: {
          DEFAULT: '1px',
          '0': '0',
          '1': '0.1rem',
          '2': '0.2rem',
          '3': '0.3rem',
          '4': '0.4rem',
          '6': '0.6rem',
          '8': '0.8rem'
        },
        zIndex: {
          '1': '1',
          '5': '5',
        }
      },
      corePlugins: {
        fontFamily: false,
        float: false,
        objectFit: false,
        objectPosition: false,
        accessibility: false,
        isolation: false,
        mixBlendMode: false,
        saturate: false
      }
    },
    autoprefixer: {},
    'postcss-nesting': {},
    'postcss-variables': {}
  }
}
