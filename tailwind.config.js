const plugin = require('tailwindcss/plugin')

const colorOrders = ['5', '10', '20', '30', '40', '50', '60', '70', '80', '90']
const colorGroups = ['primary', 'fuchsia', 'violet', 'blue', 'cyan', 'orange', 'emerald', 'red', 'gray', 'stone']

function createColorConfig() {
  const colors = {}
  colorGroups.forEach(group => {
    colors[group] = {}
    colorOrders.forEach(order => {
      colors[group][order] = `rgba(var(--app-rgb-${group}-${order}), <alpha-value>)`
    })
  })
  return {
    ...colors,
    'black': 'rgba(var(--app-rgb-black), <alpha-value>)',
    'white': 'rgba(var(--app-rgb-white), <alpha-value>)',
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

const colorCssPlugin = plugin(function ({ addBase }) {
  const rootVars = {}
  const darkVars = {}
  colorGroups.forEach(group => {
    colorOrders.forEach(order => {
      rootVars[`--app-${group}-${order}`] = `design-token('color.${group}-${order}')`
      rootVars[`--app-rgb-${group}-${order}`] = `design-token('color-rgb.${group}-${order}')`

      darkVars[`--app-${group}-${order}`] = `design-token('color-dark.${group}-${order}')`
      darkVars[`--app-rgb-${group}-${order}`] = `design-token('color-dark-rgb.${group}-${order}')`
    })
  })

  addBase({
    ':root': {
      ...rootVars,
      '--app-favicon-color-main': '#ffa4c5',
      '--app-favicon-color-sub': '#f7e4eb',
      '--app-body-bg-color': '#fefcfd',
      '--app-black': 'design-token(\'color.black\')',
      '--app-white': 'design-token(\'color.white\')',
      '--app-rgb-black': 'design-token(\'color-rgb.black\')',
      '--app-rgb-white': 'design-token(\'color-rgb.white\')',
    },
    'html.theme--night-mode': {
      ...darkVars,
      '--app-favicon-color-main': '#ffabbb',
      '--app-favicon-color-sub': '#efdae0',
      '--app-body-bg-color': '#241f2c',
      '--app-black': 'design-token(\'color-dark.black\')',
      '--app-white': 'design-token(\'color-dark.white\')',
      '--app-rgb-black': 'design-token(\'color-dark-rgb.black\')',
      '--app-rgb-white': 'design-token(\'color-dark-rgb.white\')',
    },
  })
})

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    ...getColorList('bg'),
    ...getColorList('text'),
  ],
  plugins: [
    colorCssPlugin,
  ],
  darkMode: ['class', '.theme--night-mode'],
  theme: {
    fontFamily: {
      mono: '\'Cascadia Code\', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\', var(--app-main-font), monospace',
    },
    colors: createColorConfig(),
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
    borderWidth,
    outlineWidth: borderWidth,
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
