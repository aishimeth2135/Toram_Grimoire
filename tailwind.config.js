function createColorConfig(varName) {
  const handleValue = !varName ?
    (colorName) => `var(--app-${colorName})` :
    (colorName) => `rgba(var(--rgb-app-${colorName}), var(${varName}, 1))`
  return {
    light: {
      0: handleValue('light-0'),
      DEFAULT: handleValue('light'),
      2: handleValue('light-2'),
      3: handleValue('light-3'),
      4: handleValue('light-4'),
    },
    dark: {
      DEFAULT: handleValue('dark'),
      light: handleValue('dark-light'),
    },
    white: handleValue('white'),
    black: handleValue('black'),
    red: {
      DEFAULT: handleValue('red'),
      light: handleValue('red-light'),
    },
    purple: {
      DEFAULT: handleValue('purple'),
      light: handleValue('purple-light'),
    },
    'blue-purple': {
      DEFAULT: handleValue('blue-purple'),
      light: handleValue('blue-purple-light'),
    },
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
    green: {
      DEFAULT: handleValue('green'),
      light: handleValue('green-light'),
    },
    gray: {
      DEFAULT: handleValue('gray'),
      light: handleValue('gray-light'),
    },
    transparent: 'transparent',
    current: 'currentcolor',
  }
}

const getColorList = (prefix) => {
  prefix = prefix + '-'
  const config = createColorConfig()
  const keys = []
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === 'string') {
      keys.push(prefix + key)
      return
    }
    Object.keys(value).forEach(subkey => {
      keys.push(prefix + (subkey === 'DEFAULT' ? key : `${key}-${subkey}`))
    })
  })
  return keys
}

const borderWidth = {
  DEFAULT: '1px',
  '0': '0',
  '1': '0.125rem',
  '2': '0.25rem',
  '3': '0.375rem',
  '4': '0.5rem',
  '5': '0.625rem',
  '6': '0.75rem',
  '7': '0.875rem',
  '8': '1rem',
}

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    ...getColorList('bg'),
    ...getColorList('text'),
  ],
  theme: {
    fontFamily: {
      mono: '\'Cascadia Code\', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\', var(--app-main-font), monospace',
    },
    colors: createColorConfig(),
    textColor: createColorConfig('--tw-text-opacity'),
    backgroundColor: createColorConfig('--tw-bg-opacity'),
    opacity: {
      '0': '0',
      '5': '0.05',
      '10': '0.1',
      '15': '0.15',
      '20': '0.2',
      '25': '0.25',
      '30': '0.3',
      '35': '0.35',
      '40': '0.4',
      '45': '0.45',
      '50': '0.5',
      '55': '0.55',
      '60': '0.6',
      '65': '0.65',
      '70': '0.7',
      '75': '0.75',
      '80': '0.8',
      '85': '0.85',
      '90': '0.9',
      '95': '0.95',
      '100': '1',
    },
    borderColor: createColorConfig('--tw-border-opacity'),
    borderWidth,
    outlineWidth: borderWidth,
    outlineColor: createColorConfig('--tw-border-opacity'),
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
      spacing: {
        '128': '32rem',
      },
      animation: {
        'slide-up': 'global-slide-up 0.4s ease',
      },
    },
  },
  corePlugins: {
    float: false,
    objectFit: false,
    objectPosition: false,
    accessibility: false,
    isolation: false,
    mixBlendMode: false,
    saturate: false,
  },
}
