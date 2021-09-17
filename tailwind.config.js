function createColorConfig(varName) {
  const handleValue = !varName ?
    (colorName, primary = true) => `var(--${primary ? 'primary-' : ''}${colorName})` :
    (colorName, primary = true) => `rgba(var(--rgb-${primary ? 'primary-' : ''}${colorName}), var(${varName}, 1))`;
  return {
    light: {
      DEFAULT: handleValue('light'),
      2: handleValue('light-2'),
      3: handleValue('light-3'),
      4: handleValue('light-4'),
    },
    dark: {
      DEFAULT: handleValue('dark'),
      light: handleValue('dark-light'),
    },
    white: handleValue('white', false),
    black: handleValue('black', false),
    red: {
      DEFAULT: handleValue('red'),
      light: handleValue('red-light'),
    },
    purple: handleValue('purple'),
    'water-blue': {
      DEFAULT: handleValue('water-blue'),
      light: handleValue('water-blue-light'),
    },
    'blue-green': {
      DEFAULT: handleValue('blue-green'),
      light: handleValue('blue-green-light'),
    },
    orange: {
      DEFAULT: handleValue('orange'),
      light: handleValue('orange-light'),
    },
    green: handleValue('green'),
    gray: {
      DEFAULT: handleValue('gray'),
      light: handleValue('gray-light'),
    },
    transparent: 'transparent',
    current: 'currentcolor',
  };
}

module.exports = {
  purge: {
    enabled: true,
    content: ['./src/**/*.vue'],
  },
  theme: {
    colors: createColorConfig(),
    textColor: createColorConfig('--tw-text-opacity'),
    backgroundColor: createColorConfig('--tw-bg-opacity'),
    borderColor: createColorConfig('--tw-border-opacity'),
    borderWidth: {
      DEFAULT: '1px',
      '0': '0',
      '1': '0.1rem',
      '2': '0.2rem',
      '3': '0.3rem',
      '4': '0.4rem',
      '6': '0.6rem',
      '8': '0.8rem',
    },
    zIndex: {
      '-1': '-1',
      '1': '1',
      '5': '5',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
      '100': '100',
      'auto': 'auto',
    },
    extend: {
      keyframes: {
        'global-slide-up': {
          '0%': { transform: 'translateY(120%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'global-slide-up 0.4s ease',
      },
    },
  },
  corePlugins: {
    fontFamily: false,
    float: false,
    objectFit: false,
    objectPosition: false,
    accessibility: false,
    isolation: false,
    mixBlendMode: false,
    saturate: false,
  },
};
