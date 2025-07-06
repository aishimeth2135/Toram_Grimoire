import plugin from 'tailwindcss/plugin'
import __designTokens from './src/assets/css/config/color.json'

const _designTokens = __designTokens as Record<string, Record<string, { value: string }>>

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
  const colors: Record<string, Record<string, string>> = {}
  colorGroups.forEach(group => {
    colors[group] = {}
    colorOrders.forEach(order => {
      colors[group][order] =
        `var(--app-${group}-${order})`
    })
  })
  return {
    ...colors,
    black: 'var(--app-black)',
    white: 'var(--app-white)',
    transparent: 'transparent',
    current: 'currentcolor',
    inherit: 'inherit',
  }
})()

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


function designToken(query: string) {
  const keys = query.split('.')
  let current: Record<string, unknown> | { value: string } = _designTokens
  keys.forEach(key => {
    current = current[key]
  })
  return current.value as string
}

const colorCssPlugin = plugin(function ({ addBase }) {
  const rootVars = {}
  const darkVars = {}
  colorGroups.forEach(group => {
    colorOrders.forEach(order => {
      rootVars[`--app-${group}-${order}`] = designToken(
        `color.${group}-${order}`
      )
      darkVars[`--app-${group}-${order}`] = designToken(
        `color-dark.${group}-${order}`
      )
    })
  })

  addBase({
    ':root': {
      ...rootVars,
      '--app-black': designToken('color.black'),
      '--app-white': designToken('color.white'),
    },
    'html.theme--night-mode': {
      ...darkVars,
      '--app-black': designToken('color-dark.black'),
      '--app-white': designToken('color-dark.white'),
    },
  })
})

module.exports = <import('tailwindcss').Config>{
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
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
}
