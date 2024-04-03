const plugin = require('tailwindcss/plugin')

const colorOrders = ['5', '10', '20', '30', '40', '50', '60', '70', '80', '90']
const colorGroups = [
  'primary',
  'fuchsia',
  'violet',
  'blue',
  'cyan',
  'orange',
  'emerald',
  'red',
  'gray',
  'stone',
]

const colorsConfig = (() => {
  const colors = {}
  colorGroups.forEach(group => {
    colors[group] = {}
    colorOrders.forEach(order => {
      colors[group][order] =
        `rgba(var(--app-rgb-${group}-${order}), <alpha-value>)`
    })
  })
  return {
    ...colors,
    black: 'rgba(var(--app-rgb-black), <alpha-value>)',
    white: 'rgba(var(--app-rgb-white), <alpha-value>)',
    transparent: 'transparent',
    current: 'currentcolor',
    inherit: 'inherit',
  }
})()

const getColorList = prefix => {
  prefix = prefix + '-'
  const config = colorsConfig
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
  0: '0',
  1: '0.125rem',
  2: '0.25rem',
  3: '0.375rem',
  4: '0.5rem',
  5: '0.625rem',
  6: '0.75rem',
  7: '0.875rem',
  8: '1rem',
}

const _designTokens = require('./src/assets/css/config/color.json')
function designToken(query) {
  const keys = query.split('.')
  let current = _designTokens
  keys.forEach(key => {
    current = current[key]
  })
  return current.value
}

const colorCssPlugin = plugin(function ({ addBase }) {
  const rootVars = {}
  const darkVars = {}
  colorGroups.forEach(group => {
    colorOrders.forEach(order => {
      rootVars[`--app-${group}-${order}`] = designToken(
        `color.${group}-${order}`
      )
      rootVars[`--app-rgb-${group}-${order}`] = designToken(
        `color-rgb.${group}-${order}`
      )

      darkVars[`--app-${group}-${order}`] = designToken(
        `color-dark.${group}-${order}`
      )
      darkVars[`--app-rgb-${group}-${order}`] = designToken(
        `color-dark-rgb.${group}-${order}`
      )
    })
  })

  addBase({
    ':root': {
      ...rootVars,
      '--app-black': designToken('color.black'),
      '--app-white': designToken('color.white'),
      '--app-rgb-black': designToken('color-rgb.black'),
      '--app-rgb-white': designToken('color-rgb.white'),
    },
    'html.theme--night-mode': {
      ...darkVars,
      '--app-black': designToken('color-dark.black'),
      '--app-white': designToken('color-dark.white'),
      '--app-rgb-black': designToken('color-dark-rgb.black'),
      '--app-rgb-white': designToken('color-dark-rgb.white'),
    },
  })
})

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    ...getColorList('bg'),
    ...getColorList('text'),
    ...getColorList('border'),
    ...getColorList('ring'),
  ],
  plugins: [colorCssPlugin],
  darkMode: ['class', '.theme--night-mode'],
  theme: {
    fontFamily: {
      mono: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', var(--app-main-font), monospace",
    },
    screens: {
      'wd': '800px',
      'wd-lg': '1120px',
    },
    colors: colorsConfig,
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
      spacing: {
        128: '32rem',
      },
    },
  },
  corePlugins: [
    'preflight',

    'alignContent',
    'alignItems',
    'alignSelf',

    'backgroundColor',
    'backgroundOpacity',
    'backgroundSize',
    'backgroundPosition',
    'borderColor',
    'borderOpacity',
    'borderRadius',
    'borderWidth',
    'borderStyle',
    'boxShadow',
    'boxShadowColor',
    'borderCollapse',
    'borderSpacing',

    'cursor',

    'display',
    'divideColor',
    'divideOpacity',
    'divideWidth',
    'dropShadow',

    'flex',
    'flexBasis',
    'flexDirection',
    'flexGrow',
    'flexShrink',
    'flexWrap',
    'fontFamily',
    'fontSize',
    'fontWeight',

    'height',

    'inset',

    'justifyContent',
    'justifyItems',
    'justifySelf',

    'lineHeight',

    'margin',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'maxWidth',

    'opacity',
    'outlineColor',
    'outlineStyle',
    'outlineWidth',
    'overflow',

    'padding',
    'pointerEvents',
    'position',

    'resize',
    'ringColor',
    'ringOpacity',
    'ringWidth',
    'rotate',

    'space',

    'textAlign',
    'textColor',
    'textDecoration',
    'textDecorationColor',
    'textOpacity',
    'textOverflow',
    'transitionDuration',
    'transitionTimingFunction',
    'transitionDelay',

    'verticalAlign',
    'visibility',

    'userSelect',

    'whitespace',
    'width',
    'wordBreak',

    'zIndex',
  ],
}
